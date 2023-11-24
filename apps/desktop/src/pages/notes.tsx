import { useParams } from "@solidjs/router";
import { useSocket } from "../context/socket";
import { createEffect, onMount } from "solid-js";
import { createCodeMirror } from "solid-codemirror";

export const Notes = () => {
    const params = useParams();

    const socket = useSocket();

    onMount(() => {
        socket.manager?.emit("note:join", { noteId: params.id });
    });

    const { editorView, ref: editorRef } = createCodeMirror({
        value: "",
    });

    createEffect(() => {
        // editorView.
    });

    return (
        <div>
            <div class={"text-white"}>aedwa - {JSON.stringify(params)}</div>
            <div ref={editorRef} />
        </div>
    );
};
