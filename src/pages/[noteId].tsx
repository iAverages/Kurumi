import { useColorMode } from "@chakra-ui/react";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { Notes } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Excalidraw from "../components/excalidraw";
import Monaco from "../components/monaco";
import Nav from "../components/navbar";
import NoteTitle from "../components/navTitle";
import { Show } from "../components/show";
import useBoolean from "../hooks/useBoolean";
import { useWebsocket } from "../hooks/useWebsocket";

const Note = () => {
    const router = useRouter();
    const { socket } = useWebsocket();
    const { value: usingExcalidraw, on: enableExcalidraw, off: disableExcalidraw } = useBoolean();
    const [data, setData] = useState<Notes>();
    const { colorMode } = useColorMode();
    const { noteId } = router.query;

    useEffect(() => {
        if (!socket || !noteId) return;
        if (data) return;
        socket.emit("joinNote", { noteId: noteId as string });
        socket.emit("getNote", noteId as string, (response) => {
            if (response.success) {
                setData(response.data);
                return;
            }
            console.error(response.error ?? "Failed to get note");
        });
        return () => {
            socket.emit("leaveNote", { noteId: noteId as string });
        };
    }, [socket, noteId, data]);

    useEffect(() => {
        socket.on("noteChanged", ({ data }) => {
            setData((prev) => {
                const newData = prev ?? data;
                newData.content = prev?.content ?? data.content;
                newData.excalidraw = prev?.excalidraw ?? data.excalidraw;
                return newData;
            });
        });

        socket.emit("joinNote", { noteId: noteId as string });

        return () => {
            socket.off("noteChanged");
            socket.emit("leaveNote", { noteId: noteId as string });
        };
    }, [socket, noteId]);

    const handleMonacoChange = (value: string | undefined) => {
        if (!value) return;
        socket.emit("noteUpdate", { noteId: noteId as string, text: value });
    };

    const handleExcalidrawChange = (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
        if (!usingExcalidraw) return;
        // Saving collaborators to db is not needed, it breaks excalidraw
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { collaborators, ...restAppState } = appState;

        socket.emit("drawUpdate", {
            noteId: noteId as string,
            value: JSON.stringify({ appState: restAppState, files, elements }),
        });
    };

    return (
        <Show when={data}>
            {(loadedData) => (
                <div className={"h-screen w-screen"}>
                    <Nav
                        title={<NoteTitle note={loadedData} />}
                        icons={
                            <Show when={!usingExcalidraw} fallback={<button onClick={disableExcalidraw}>Markdown</button>}>
                                <button onClick={enableExcalidraw}>Excalidraw</button>
                            </Show>
                        }
                    />
                    <Show
                        when={!usingExcalidraw}
                        fallback={
                            <Excalidraw
                                initialData={JSON.parse(loadedData.excalidraw ?? "{}")}
                                onChange={handleExcalidrawChange}
                            />
                        }
                    >
                        <Monaco value={loadedData.content} onChange={handleMonacoChange} colorMode={colorMode} />
                    </Show>
                </div>
            )}
        </Show>
    );
};

export default Note;
