import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { z } from "zod";
import { t, authedProcedure } from "../trpc";

const ee = new EventEmitter();

export const authRouter = t.router({
    getSession: t.procedure.query(({ ctx }) => {
        return ctx.session;
    }),
    getSecretMessage: authedProcedure.query(() => {
        return "You are logged in and can see this secret message!";
    }),
    test: authedProcedure.subscription(() => {
        return observable<{ test: string }>((emit) => {
            const onAdd = (data: { test: string }) => emit.next(data);
            ee.on("add", onAdd);
            return () => {
                ee.off("add", onAdd);
            };
        });
    }),
    test2: authedProcedure.input(z.object({ test: z.string() })).mutation(({ input }) => {
        ee.emit("add", input);
    }),
});
