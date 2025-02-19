import { z } from "zod";
import { j, privateProcedure } from "../jstack";
import { desc, eq } from "drizzle-orm";
import * as schema from "../db/schema";

export const notesRouter = j.router({
	getAll: privateProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				pageSize: z.number().min(1).max(100).default(10),
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
});
