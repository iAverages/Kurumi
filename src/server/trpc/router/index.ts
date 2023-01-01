import { t } from "../trpc";
import { authRouter } from "./auth";
import { notesRouter } from "./notes";

export const appRouter = t.router({
    auth: authRouter,
    notes: notesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
