import { j, privateProcedure, publicProcedure } from "../jstack";
import { z } from "zod";
import { lower, sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import bcrypt from "bcryptjs";

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
				password: z.string().min(8).max(100),
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

			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(password, salt);
			await db.insert(users).values({
				email,
				passwordHash: hashedPassword,
			});
		}),
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(8).max(100),
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

			const isPasswordCorrect = await bcrypt.compare(
				password,
				user.passwordHash
			);
			if (!isPasswordCorrect) {
				throw new HTTPException(400, { message: "Invalid email or password" });
			}

			const [session] = await db
				.insert(sessions)
				.values({
					userId: user.id,
					expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
				})
				.returning();

			setCookie(c, "session_id", session!.id, {
				httpOnly: true,
				path: "/",
				sameSite: "lax",
				expires: session!.expiresAt,
			});

			return c.superjson({ session: session! });
		}),
	logout: privateProcedure.mutation(async ({ ctx, c }) => {
		const { db, session } = ctx;

		await db.delete(sessions).where(eq(sessions.id, session.id));
		deleteCookie(c, "session_id");
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

			const isPasswordCorrect = await bcrypt.compare(
				oldPassword,
				user.passwordHash
			);
			if (!isPasswordCorrect) {
				throw new HTTPException(400, { message: "Invalid password" });
			}

			const salt = await bcrypt.genSalt();
			const passwordHash = await bcrypt.hash(newPassword, salt);
			await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

			return c.superjson({ success: true });
		}),
});
