import "~/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { trpc } from "~/utils/trpc";
import { ChakraProvider } from "@chakra-ui/react";
import { SocketManager } from "~/components/socket";
import OnlyAuthenticated from "~/components/onlyAuthenticated";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
    return (
        <>
            <Head>
                <title>Kurumi Notes</title>
                <meta name="description" content="Simple note taking app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <SocketManager>
                <ChakraProvider>
                    <SessionProvider session={session}>
                        <OnlyAuthenticated>
                            <Component {...pageProps} />
                        </OnlyAuthenticated>
                    </SessionProvider>
                </ChakraProvider>
            </SocketManager>
        </>
    );
};

export default trpc.withTRPC(MyApp);
