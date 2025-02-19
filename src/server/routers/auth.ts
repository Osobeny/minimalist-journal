import { j, privateProcedure, publicProcedure } from "../jstack";
import { z } from "zod";
import { lower, sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteCookie, setCookie } from "hono/cookie";
import { hash, verify } from "@node-rs/argon2";
import { HTTPException } from "hono/http-exception";
import { argonOptions, SESSION_EXPIRES_IN_MS } from "../constants";

export const authRouter = j.router({
	me: privateProcedure.query(async ({ ctx, c }) => {
		const { user } = ctx;

		return c.superjson({
			user: {
				id: user.id,
				email: user.email,
				createdAt: user.createdAt,
			},
		});
	}),
	register: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(8).max(255),
			})
		)
		.mutation(async ({ ctx, c, input }) => {
			const { email, password } = input;
			const { db } = ctx;

			const user = await db.query.users.findFirst({
				where: eq(lower(users.email), email.toLowerCase()),
			});

			if (user) {
				throw new HTTPException(400, { message: "User already exists" });
			}

			const hashedPassword = await hash(password, argonOptions);
			await db.insert(users).values({
				email,
				passwordHash: hashedPassword,
			});
		}),
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(8).max(255),
			})
		)
		.mutation(async ({ ctx, c, input }) => {
			const { email, password } = input;
			const { db } = ctx;

			const user = await db.query.users.findFirst({
				where: eq(lower(users.email), email.toLowerCase()),
			});

			if (!user) {
				throw new HTTPException(400, { message: "Invalid email or password" });
			}

			const isPasswordCorrect = await verify(user.passwordHash, password);
			if (!isPasswordCorrect) {
				throw new HTTPException(400, { message: "Invalid email or password" });
			}

			const [session] = await db
				.insert(sessions)
				.values({
					userId: user.id,
					expiresAt: new Date(Date.now() + SESSION_EXPIRES_IN_MS),
				})
				.returning();

			setCookie(c, "session_id", session!.id, {
				httpOnly: true,
				path: "/",
				sameSite: "lax",
				expires: session!.expiresAt,
			});
		}),
	logout: privateProcedure.mutation(async ({ ctx, c }) => {
		const { db, session } = ctx;

		await db.delete(sessions).where(eq(sessions.id, session.id));
		deleteCookie(c, "session_id");

		return c.superjson({ success: true });
	}),
	changePassword: privateProcedure
		.input(
			z.object({
				oldPassword: z.string().min(8).max(255),
				newPassword: z.string().min(8).max(255),
			})
		)
		.mutation(async ({ ctx, c, input }) => {
			const { oldPassword, newPassword } = input;
			const { db, user } = ctx;

			const isPasswordCorrect = await verify(user.passwordHash, oldPassword);
			if (!isPasswordCorrect) {
				throw new HTTPException(400, { message: "Invalid password" });
			}

			const passwordHash = await hash(newPassword, argonOptions);
			await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

			return c.superjson({ success: true });
		}),
});
