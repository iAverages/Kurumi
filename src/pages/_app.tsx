import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { ChakraProvider } from "@chakra-ui/react";
import { SocketManager } from "../components/socket";
import OnlyAuthenticated from "../components/onlyAuthenticated";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
    return (
        <SocketManager>
            <ChakraProvider>
                <SessionProvider session={session}>
                    <OnlyAuthenticated>
                        <Component {...pageProps} />
                    </OnlyAuthenticated>
                </SessionProvider>
            </ChakraProvider>
        </SocketManager>
    );
};

export default trpc.withTRPC(MyApp);
