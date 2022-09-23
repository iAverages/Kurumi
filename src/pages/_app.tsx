import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import { SocketManager } from "../components/socket";
import { ChakraProvider } from "@chakra-ui/react";

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
        // Starts websocket server
        // Is there a better way to do this?
        // I dont like it lol
        fetch("/api/socket");
    }, []);

    return (
        <SocketManager>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </SocketManager>
    );
}

export default MyApp;
