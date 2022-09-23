import { useToast } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useWebsocket } from "../hooks/useWebsocket";
import { SocketEvents } from "../socketEvents";

export interface ISocketContext {
    socket: Socket;
}
const socket = io();

export const SocketContext = React.createContext<ISocketContext>({ socket /*registerEvent: new Map()*/ });

/**
 * Contains base logic for websocket connection
 * @returns
 */
const SocketInterface: React.FC<{ children: any }> = ({ children }) => {
    const toast = useToast();
    const { socket, connected } = useWebsocket();

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

    return children;
};

export const SocketManager: React.FC<{ children: any }> = ({ children }) => {
    return (
        <SocketContext.Provider value={{ socket }}>
            <SocketInterface>{children}</SocketInterface>
        </SocketContext.Provider>
    );
};

export default SocketContext;
