import { Notes } from "@prisma/client";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "../types/websocket.events";
import { debounce } from "../utils/debouce";
import { prisma } from "./db/client";

type WebsocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
const noteSaveDebouceMap = new Map<string, (id: string, noteChanges: Partial<Notes>) => void>();

const debouceSaveInit = () =>
    debounce(
        async (id: string, noteChanges: Partial<Notes>) => {
            await prisma.notes.update({
                where: { id },
                data: noteChanges,
            });
            console.log("Saved note:", id);
            noteSaveDebouceMap.delete(id);
        },
        2000,
        10000
    );

export const initWebsocketServer = (server: WebsocketServer) => {
    server.on("connection", (socket) => {
        console.log("Connected", socket.id);

        socket.on("textUpdate", async ({ noteId, text }) => {
            let saveNote = noteSaveDebouceMap.get(noteId);
            if (!saveNote) {
                saveNote = debouceSaveInit();
                noteSaveDebouceMap.set(noteId, saveNote);
                console.log("Created new save debouce for ", noteId);
            }

            socket.to(noteId).emit("textChanged", { fromId: socket.id, text });
            saveNote(noteId, { content: text });
        });

        socket.on("drawUpdate", async ({ noteId, value }) => {
            let saveNote = noteSaveDebouceMap.get(noteId);
            if (!saveNote) {
                saveNote = debouceSaveInit();
                noteSaveDebouceMap.set(noteId, saveNote);
                console.log("Created new save debouce for ", noteId);
            }

            socket.to(noteId).emit("drawChanged", { fromId: socket.id, value });
            saveNote(noteId, { excalidraw: value });
        });
    });

    return server;
};
