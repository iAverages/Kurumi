import { z } from "zod";
import { t, authedProcedure } from "../trpc";
//
export const notesRouter = t.router({
    getNote: authedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            return ctx.prisma.notes.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    user: true,
                },
            });
        }),
    getNotes: authedProcedure
        .input(
            z.object({
                limit: z.number(),
                cursor: z.string().nullish(),
                orderBy: z.enum(["asc", "desc"]),
            })
        )
        .query(async ({ input, ctx }) => {
            const limit = input.limit ?? 50;
            const { cursor } = input;
            const items = await ctx.prisma.notes.findMany({
                take: limit + 1, // get an extra item at the end which we'll use as next cursor
                where: {
                    user: {
                        id: {
                            equals: ctx.session.user.id,
                        },
                    },
                    deletedAt: {
                        equals: null,
                    },
                },
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    updatedAt: "asc",
                },
                include: {
                    user: true,
                },
            });
            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem?.id;
            }
            return {
                items,
                nextCursor,
            };
        }),
    createNote: authedProcedure.mutation(async ({ ctx }) => {
        const note = await ctx.prisma.notes.create({
            data: {
                content: "",
                excalidraw: "{}",
                title: "Untitled",
                user: {
                    connect: {
                        id: ctx.session.user.id,
                    },
                },
            },
        });
        return note;
    }),
    deleteNote: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
        await ctx.prisma.notes.update({
            where: {
                id: input,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }),
});
