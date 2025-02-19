import { InferMiddlewareOutput, jstack } from "jstack";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "hono/adapter";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

interface Env {
	Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

/**
 * Type-safely injects database into all procedures
 * @see https://jstack.app/docs/backend/middleware
 *
 * For deployment to Cloudflare Workers
 * @see https://developers.cloudflare.com/workers/tutorials/postgres/
 */
const databaseMiddleware = j.middleware(async ({ c, next }) => {
	const { DATABASE_URL } = env(c);

	const db = drizzle(DATABASE_URL, { schema });

	return await next({ db });
});

type DBMiddlewareOutput = InferMiddlewareOutput<typeof databaseMiddleware>;

const authMiddleware = j.middleware(async ({ c, ctx, next }) => {
	const sessionId = getCookie(c, "session_id");
	if (!sessionId) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	const { db } = ctx as DBMiddlewareOutput;
	const sessionWithUser = await db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		with: { user: true },
	});

	if (!sessionWithUser) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	if (sessionWithUser.expiresAt < new Date()) {
		await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));

		throw new HTTPException(401, { message: "Unauthorized" });
	}

	const { user, ...session } = sessionWithUser;
	return await next({ user, session });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware);
export const privateProcedure = publicProcedure.use(authMiddleware);
