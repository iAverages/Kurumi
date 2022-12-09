import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { ChakraProvider } from "@chakra-ui/react";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
    return (
        <ChakraProvider>
            <SessionProvider session={session}>
                <Component {...pageProps} />
            </SessionProvider>
        </ChakraProvider>
    );
};

export default trpc.withTRPC(MyApp);
