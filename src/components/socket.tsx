import { useToast } from "@chakra-ui/react";
import React, { ReactNode, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useWebsocket } from "../hooks/useWebsocket";
import { ClientToServerEvents, ServerToClientEvents } from "../types/websocket.events";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    process.env.NEXT_PUBLIC_WEBSOCKET_HOST ?? "ws://localhost:3001",
    {
        reconnection: true,
        reconnectionDelay: 2000,
        transports: ["websocket", "polling"],
        rememberUpgrade: true,
    }
);

export const SocketContext = React.createContext<{
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}>({ socket });

/**
 * Contains base logic for websocket connection
 * @returns
 */
const SocketInterface: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket, connected } = useWebsocket();
    const toast = useToast();

    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        toast({
            title: connected ? "Connected to websocket" : "Disconnected from websocket",
            status: connected ? "success" : "error",
            duration: 7000,
            isClosable: true,
        });
    }, [connected, toast]);

    return <>{children}</>;
};

export const SocketManager: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SocketContext.Provider value={{ socket }}>
            <SocketInterface>{children}</SocketInterface>
        </SocketContext.Provider>
    );
};

export default SocketContext;
