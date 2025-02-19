import { j, privateProcedure, publicProcedure } from "../jstack";
import { z } from "zod";
import { sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";
import { hash, verify } from "@node-rs/argon2";
import { HTTPException } from "hono/http-exception";

export const authRouter = j.router({
	me: privateProcedure.query(async ({ ctx, c }) => {
		const { user } = ctx;

		return c.superjson({
			id: user.id,
			email: user.email,
			createdAt: user.createdAt,
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

			// TODO: Implement me
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

			// TODO: Implement me
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

			const passwordHash = await hash(newPassword);
			await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

			return c.superjson({ success: true });
		}),
});
