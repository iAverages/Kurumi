// Currently does not work as excepted
// need to find out why
import { useEffect } from "react";
import { SocketEvents } from "../socketEvents";
import { useWebsocket } from "./useWebsocket";

export const useWebsocketEvent = (event: SocketEvents, cb: (...args: Record<string, any>[]) => void) => {
    const { socket } = useWebsocket();

    useEffect(() => {
        const parsedCb = (...data: any[]) => {
            const parsed: Record<string, any>[] = [];
            for (const arg of data) {
                parsed.push(JSON.parse(arg));
            }
            cb(...parsed);
        };
        socket.on(event, cb);
        socket.on(event, parsedCb);
        return () => {
            socket.off(event, parsedCb);
        };
    }, [socket, event, cb]);
};
