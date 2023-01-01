import { useContext, useEffect, useState } from "react";
import SocketContext from "../components/socket";

export const useWebsocket = () => {
    const { socket } = useContext(SocketContext);
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const handleConnected = () => {
            console.log("Connected to websocket!");
            setConnected(true);
        };
        const handleDisconnected = () => {
            console.warn("Disconnected form websocket");
            setConnected(false);
        };

        socket.on("connect", handleConnected);
        socket.on("disconnect", handleDisconnected);

        return () => {
            socket.off("connect", handleConnected);
            socket.off("disconnect", handleDisconnected);
        };
    }, [socket]);

    return { socket, connected };
};
