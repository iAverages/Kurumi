import { For, createSignal, onCleanup, onMount } from "solid-js";
import { useSocket } from "../context/socket";
import { useNotesList } from "../hooks/useNotesList";
import { Link, Outlet } from "@solidjs/router";
import { cn } from "../utils/ui";

const MAX_SIDEBAR_WIDTH = 300;
const MIN_SIDEBAR_WIDTH = 100;
const DEFAULT_SIDEBAR_WIDTH = 200;

export const Home = () => {
    let sidebarDrag: HTMLDivElement | undefined;
    const socket = useSocket();
    const notes = useNotesList();
    const [size, setSize] = createSignal(DEFAULT_SIDEBAR_WIDTH);
    const [isHeld, setIsHeld] = createSignal(false);

    onMount(() => {
        socket.manager.on("note:created", (data) => {
            console.log("note:created", data);
        });
    });

    onCleanup(() => {
        socket.manager.off("note:created");
    });

    const handleMouseUp = () => {
        setIsHeld(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isHeld()) return;
        const sidebarWidth = sidebarDrag?.offsetWidth ?? 0;
        const mousePos = e.clientX - sidebarWidth;
        setSize(Math.max(Math.min(mousePos, MAX_SIDEBAR_WIDTH), MIN_SIDEBAR_WIDTH));
    };

    onMount(() => {
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);
    });

    onCleanup(() => {
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
    });

    return (
        <div class={"flex flex-col text-white h-screen flex-grow"}>
            <h1>Notes</h1>
            <div class={"flex gap-2 flex-grow"}>
                <div
                    style={{ width: size() + "px" }}
                    class={" "}
                    onDrag={() => {
                        console.log("drag");
                        setSize(size() + 1);
                    }}
                >
                    <For each={notes.data} fallback={<>No Note found</>}>
                        {(note) => (
                            <Link href={`/notes/${note.id}`}>
                                <div>{note.id}</div>
                            </Link>
                        )}
                    </For>
                </div>
                <div
                    ref={sidebarDrag}
                    class={cn("p-2 cursor-grab group", {
                        "cursor-grabbing": isHeld(),
                    })}
                    onMouseDown={(e) => {
                        setIsHeld(true);
                        e.preventDefault();
                    }}
                >
                    <div
                        class={
                            "group-hover:bg-slate-700 rounded-full duration-150 w-1 transition-colors bg-slate-800 h-full"
                        }
                    ></div>
                </div>
                <div class={"col-span-10 bg-violet-600"}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
