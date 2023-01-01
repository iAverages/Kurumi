import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { Notes, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useWebsocket } from "../hooks/useWebsocket";
import Excalidraw from "./excalidraw";
import Monaco from "./monaco";

type EditorProps = {
    data: Notes & {
        user: User;
    };
    showExcalidraw: boolean;
};

const Editor: React.FC<EditorProps> = ({ data, showExcalidraw }) => {
    const { socket } = useWebsocket();
    const [excaliData, setExcaliData] = useState(data.excalidraw !== "" ? JSON.parse(data.excalidraw) : {});

    useEffect(() => {
        setExcaliData(data.excalidraw !== "" ? JSON.parse(data.excalidraw) : {});
    }, [data]);

    const handleMonacoChange = (value: string | undefined) => {
        if (!value) return;
        socket.emit("textUpdate", { noteId: data.id, text: value });
    };

    const handleExcalidrawChange = (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
        console.log("elements", elements);
        console.log("appState", appState);
        console.log("files", files);

        // Saving collaborators to db is not needed, it breaks excalidraw
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { collaborators, ...restAppState } = appState;
        socket.emit("drawUpdate", { noteId: data.id, value: JSON.stringify({ elements, appState: restAppState, files }) });
    };

    useEffect(() => {
        console.log("excaliData", excaliData);
    }, [excaliData]);

    return (
        <>
            {!showExcalidraw && <Monaco value={data.content} onChange={handleMonacoChange} />}
            {showExcalidraw && <Excalidraw initialData={excaliData} onChange={handleExcalidrawChange} />}
        </>
    );
};

export default Editor;
