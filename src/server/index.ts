import { j } from "./jstack";
import { authRouter } from "./routers/auth";
import { notesRouter } from "./routers/notes";
import { cors } from "hono/cors";

const appCors = cors({
	allowHeaders: ["x-is-superjson", "Content-Type"],
	exposeHeaders: ["x-is-superjson"],
	allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	origin: "http://localhost:3000",
	credentials: true,
});

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
	.router()
	.basePath("/api")
	.use(appCors)
	.onError(j.defaults.errorHandler);

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
	auth: authRouter,
	notes: notesRouter,
});

export type AppRouter = typeof appRouter;

export default appRouter;
