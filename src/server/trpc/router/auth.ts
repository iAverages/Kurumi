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
    test: t.procedure.subscription(() => {
        return observable<string>((emit) => {
            const onAdd = (data: string) => emit.next(data);
            ee.on("add", onAdd);
            return () => {
                ee.off("add", onAdd);
            };
        });
    }),
    updateNoteText: t.procedure
        .input(
            z.object({
                content: z.string(),
                id: z.string(),
            })
        )
        .mutation(({ input, ctx }) => {
            ee.emit("add", input.content);
            // return ctx.prisma.notes.update({
            //     data: {
            //         content: input.content,
            //     },
            //     where: { id: input.id },
            // });
        }),
});
