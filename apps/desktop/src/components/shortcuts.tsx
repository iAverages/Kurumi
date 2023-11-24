import { useNavigate } from "@solidjs/router";
import { JSX, onCleanup, onMount } from "solid-js";

type Shortcut = {
    key: (event: KeyboardEvent) => boolean;
    action: () => void;
};

export const ShortcutsManager = (props: { children: JSX.Element }) => {
    const navigate = useNavigate();

    const shortcuts: Shortcut[] = [
        {
            key: (event) => event.key === "n" && event.ctrlKey,
            action: () => {
                console.log("new note");
            },
        },
        {
            key: (event) => event.key === "d" && event.ctrlKey && event.altKey,

            action: () => {
                navigate("/debug");
            },
        },
    ];
    const handleKeyDown = (e: KeyboardEvent) => {
        shortcuts.forEach((shortcut) => {
            if (shortcut.key(e)) {
                shortcut.action();
            }
        });
    };

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown);
    });

    onCleanup(() => {
        window.removeEventListener("keydown", handleKeyDown);
    });

    return <>{props.children}</>;
};
