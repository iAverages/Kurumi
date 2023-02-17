import { Notes } from "@prisma/client";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "../types/websocket.events";
import { debounce } from "../utils/debouce";
import { prisma } from "./db/client";
import { parse } from "cookie";

type WebsocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type NoteSaveDebouce = ReturnType<typeof debouceSaveInit>;
const noteSaveDebouceMap = new Map<string, NoteSaveDebouce>();
const noteSaveForceMap = new Map<string, () => void>();

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
    server.use(async (socket, next) => {
        const cookies = parse(socket.handshake.headers.cookie ?? "");
        if (cookies["next-auth.session-token"] === undefined) {
            return next(new Error("Authentication error"));
        }
        const session = await prisma.session.findUnique({
            where: {
                sessionToken: cookies["next-auth.session-token"],
            },
        });
        if (!session) {
            return next(new Error("Authentication error"));
        }
        next();
    });

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
            const forceNoteSave = saveNote(noteId, { content: text });
            noteSaveForceMap.set(noteId, forceNoteSave);
        });

        socket.on("drawUpdate", async ({ noteId, value }) => {
            let saveNote = noteSaveDebouceMap.get(noteId);
            if (!saveNote) {
                saveNote = debouceSaveInit();
                noteSaveDebouceMap.set(noteId, saveNote);
                console.log("Created new save debouce for ", noteId);
            }

            socket.to(noteId).emit("drawChanged", { fromId: socket.id, value });
            const forceNoteSave = saveNote(noteId, { excalidraw: value });
            noteSaveForceMap.set(noteId, forceNoteSave);
        });

        socket.on("joinNote", ({ noteId }) => {
            socket.join(noteId);
            console.log("Joined note", noteId);
        });

        socket.on("leaveNote", ({ noteId }) => {
            socket.leave(noteId);
            if (socket.rooms.has(noteId)) {
                const saveNote = noteSaveForceMap.get(noteId);
                if (saveNote) {
                    saveNote();
                }
            }
        });
    });

    return server;
};
