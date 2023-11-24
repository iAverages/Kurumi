import { Link } from "@solidjs/router";
import { createSignal } from "solid-js";
import { useSocket } from "../context/socket";
import { Button } from "../components/ui/button";
import { useUser } from "../hooks/useUser";

export const Debug = () => {
    const [data, setData] = createSignal("");
    const user = useUser();
    const socket = useSocket();

    const click = async () => {
        const res = await fetch("http://localhost:3001/api/v1");
        if (!res.ok) {
            setData("Errored");
            console.log(res);
            return;
        }

        const body = await res.text();

        setData(body ?? "no body");
    };

    return (
        <div class={"flex flex-col text-white gap-3"}>
            <div>User: {JSON.stringify(user.data)}</div>
            <div>Websocket status: {socket.connected ? <>connected</> : <>not connected</>}</div>
            <Button onClick={click} class="p-2 bg-gradient-to-r from-sky-200 to-violet-300">
                send req
            </Button>
            <Button
                onClick={() => {
                    socket.manager?.emit("note:join", { noteId: "yippie" });
                }}
            >
                WS req
            </Button>
            <div class={"bg-red-500 text-white"}>{data()}</div>

            <Button>
                <Link href={"/notes/123"}>Go to note </Link>
            </Button>

            <Link href={"/login"}>Login</Link>
            <Link href={"/register"}>Register</Link>
        </div>
    );
};
