/**
 * NOTE: This will be reworked to use CRDT (YJS) and actually
 * support multiple clients at the same time
 * Since only I will be used this for now I will do it like this
 * as there is some issues I need to work out with using monaco
 * with nextjs and yjs/y-monaco
 */
import { useColorMode } from "@chakra-ui/react";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useWebsocket } from "../hooks/useWebsocket";
import { SocketEvents, TextChanged } from "../socketEvents";
export type MonacoEditor = monaco.editor.IStandaloneCodeEditor;

interface IEditor {
    content: string;
}

const Editor: FC<IEditor> = ({ content }) => {
    const router = useRouter();
    const { socket } = useWebsocket();
    const { colorMode } = useColorMode();
    const { noteId } = router.query;
    const [editor, setEditor] = useState<MonacoEditor>();
    const [text, setText] = useState<string>("");

    const handleMount = (_editor: MonacoEditor) => setEditor(_editor);

    const handleChange = (newText: string | undefined) => {
        setText(newText ?? "");
        socket.emit(SocketEvents.TextUpdate, { noteId, text: newText });
        console.log("Emitted change to websocket -", noteId);
    };

    useEffect(() => {
        socket.emit(SocketEvents.UpdateNoteId, noteId);
        return () => {
            socket.emit(SocketEvents.LeaveNote);
        };
    }, [noteId, socket]);

    useEffect(() => {
        if (!editor) return;

        const hanleTextChange = (a: TextChanged) => {
            console.log(`Note updated from ${a.fromId}`);
            setText(a.text);
        };

        socket.on(SocketEvents.TextChanged, hanleTextChange);

        return () => {
            socket.off(SocketEvents.TextChanged, hanleTextChange);
        };
    }, [editor, socket]);

    useEffect(() => {
        setText(content);
    }, [content]);

    return (
        <MonacoEditor
            theme={colorMode === "dark" ? "vs-dark" : "light"}
            height={"calc(100% -  var(--chakra-sizes-16))"}
            value={text}
            onChange={handleChange}
            onMount={handleMount}
        />
    );
};

export default Editor;
