import { z } from "zod";
import { j, privateProcedure } from "../jstack";
import { and, desc, eq, ilike } from "drizzle-orm";
import * as schema from "../db/schema";

export const notesRouter = j.router({
	getAll: privateProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				pageSize: z.number().min(1).max(50).default(10),
			})
		)
		.query(async ({ ctx, c, input }) => {
			const { db, user } = ctx;
			const { page, pageSize } = input;
			const offset = (page - 1) * pageSize;

			const notes = await db.query.notes.findMany({
				where: eq(schema.notes.userId, user.id),
				limit: pageSize,
				offset,
				orderBy: desc(schema.notes.createdAt),
			});

			const totalNotes = await db.$count(
				schema.notes,
				eq(schema.notes.userId, user.id)
			);

			return c.superjson({
				notes,
				totalPages: Math.ceil(totalNotes / pageSize),
				currentPage: page,
			});
		}),
	create: privateProcedure
		.input(z.object({ content: z.string().min(1).max(1000) }))
		.mutation(async ({ ctx, c, input }) => {
			const { db, user } = ctx;
			const { content } = input;

			const note = await db
				.insert(schema.notes)
				.values({
					content,
					userId: user.id,
				})
				.returning();

			return c.superjson(note);
		}),
	update: privateProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				content: z.string().min(1).max(1000),
			})
		)
		.mutation(async ({ ctx, c, input }) => {
			const { db, user } = ctx;
			const { id, content } = input;

			const note = await db
				.update(schema.notes)
				.set({ content })
				.where(and(eq(schema.notes.id, id), eq(schema.notes.userId, user.id)))
				.returning();

			return c.superjson(note);
		}),
	delete: privateProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { db, user } = ctx;
			const { id } = input;

			await db
				.delete(schema.notes)
				.where(and(eq(schema.notes.id, id), eq(schema.notes.userId, user.id)));
		}),
	search: privateProcedure
		.input(
			z.object({
				query: z.string().min(1),
				page: z.number().min(1).default(1),
				pageSize: z.number().min(1).max(50).default(10),
			})
		)
		.query(async ({ ctx, c, input }) => {
			const { db, user } = ctx;
			const { query, page, pageSize } = input;
			const offset = (page - 1) * pageSize;

			const notes = await db.query.notes.findMany({
				where: and(
					eq(schema.notes.userId, user.id),
					ilike(schema.notes.content, `%${query}%`)
				),
				limit: pageSize,
				offset,
				orderBy: desc(schema.notes.createdAt),
			});

			const totalNotes = await db.$count(
				schema.notes,
				and(
					eq(schema.notes.userId, user.id),
					ilike(schema.notes.content, `%${query}%`)
				)
			);

			return c.superjson({
				notes,
				totalPages: Math.ceil(totalNotes / pageSize),
				currentPage: page,
			});
		}),
});
