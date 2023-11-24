import { io, type Socket } from "socket.io-client";
import { createContext, createEffect, JSX, onCleanup, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { useUser } from "../hooks/useUser";
import { env } from "../env";

const manager = io(env.VITE_API_URL, {
    transports: ["websocket"],
    autoConnect: false,
});

const SocketContext = createContext<SocketContextType>({
    manager,
    connected: false,
} as SocketContextType);

type SocketState = {
    manager: Socket;
    connected: boolean;
};
type SocketContextType = SocketState & {};

const log = (...props: any[]) => {
    console.log("[SOCKET]", ...props);
};

export const SocketProvider = (props: { children: JSX.Element }) => {
    const [state, setState] = createStore<SocketState>({
        manager,
        connected: manager.connected,
    });

    manager.on("connect", () => {
        log("Connected to socket");
        setState("connected", true);
    });

    const user = useUser();

    const initSocket = async () => {
        if (state.connected) {
            setState("connected", true);
            log("Tried to init socket but already connected");
            return;
        }
        if (!user.data?.id) {
            log("Not logged in yet, not connecting to socket");
            return;
        }
        await new Promise((res) => setTimeout(res, 2500));
        log("Connecting to socket...");

        state.manager.connect();
    };

    onMount(() => {
        initSocket();
    });

    onCleanup(() => {
        state.manager?.disconnect();
    });

    return <SocketContext.Provider value={state}>{props.children}</SocketContext.Provider>;
};

export const useSocket = () => useContext<SocketContextType>(SocketContext);
