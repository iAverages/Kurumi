import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/trpc/router";
import superjson from "superjson";
import { NextPageContext } from "next";
import { wsLink, createWSClient } from "@trpc/client/links/wsLink";
import getConfig from "next/config";
import { env } from "../env/client.mjs";

const { publicRuntimeConfig } = getConfig();
const { APP_URL } = publicRuntimeConfig;

function getEndingLink(ctx: NextPageContext | undefined) {
    if (typeof window === "undefined") {
        return httpBatchLink({
            url: `${APP_URL}/api/trpc`,
            headers() {
                if (ctx?.req) {
                    // on ssr, forward client's headers to the server
                    return {
                        ...ctx.req.headers,
                        "x-ssr": "1",
                    };
                }
                return {};
            },
        });
    }
    const client = createWSClient({
        url: env.NEXT_PUBLIC_WS_URL,
    });
    return wsLink<AppRouter>({
        client,
    });
}

export const trpc = createTRPCNext<AppRouter>({
    config({ ctx }) {
        return {
            transformer: superjson,
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                getEndingLink(ctx),
            ],
        };
    },
    ssr: false,
});
