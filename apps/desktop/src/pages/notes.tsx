import { useParams } from "@solidjs/router";
import { useSocket } from "../context/socket";
import { Match, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createCodeMirror, createEditorControlledValue } from "solid-codemirror";
import { Note } from "../types/notes";

const Editor = ({ note }: { note: Note }) => {
    const socket = useSocket();
    const [editorContent, setEditorContent] = createSignal(note.content);
    const { editorView, ref: editorRef } = createCodeMirror({
        onValueChange: (value) => {
            if (editorContent() === value) return;
            socket.manager?.emit("note:update", { id: note.id, content: value });
            setEditorContent(value);
        },
    });

    createEditorControlledValue(editorView, editorContent);

    onMount(() => {
        socket.manager?.on(`note:update:${note.id}`, (data) => {
            setEditorContent(data.content);
        });
    });

    onCleanup(() => {
        socket.manager?.off(`note:update:${note.id}`);
    });

    return <div ref={editorRef} />;
};

export const Notes = () => {
    const params = useParams();
    const socket = useSocket();
    const [data, setData] = createSignal<Note | null>(null);

    onMount(() => {
        socket.manager?.emit("note:join", { id: params.id }, (data: Note) => {
            console.log("joined", data);
            setData(data);
        });
    });

    createEffect(() => {
        console.log("note params", params.id);
    });

    onCleanup(() => {
        console.log("leaving", params, data());
        socket.manager?.emit("note:leave", { id: data()?.id });
    });

    return (
        <div>
            <Switch fallback={<div class={"text-white"}>Loading...</div>}>
                <Match when={data()}>{(d) => <Editor note={d()} />}</Match>
            </Switch>
        </div>
    );
};
