import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "../types/websocket.events";
import { prisma } from "./db/client";
import { parse } from "cookie";
import { Notes } from "@prisma/client";

type WebsocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

type ActiveNote = { data: Notes; lastUpdate: number; updates: number };

export const initWebsocketServer = (server: WebsocketServer) => {
    server.use(async (socket, next) => {
        const cookies = parse(socket.handshake.headers.cookie ?? "");
        const token = cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];
        if (token === undefined) {
            return next(new Error("Authentication error"));
        }
        const session = await prisma.session.findUnique({
            where: {
                sessionToken: token,
            },
        });
        if (!session) {
            return next(new Error("Authentication error"));
        }
        socket.handshake.auth.userId = session.userId;
        next();
    });

    const activeNotes = new Map<string, ActiveNote>();

    const saveNote = async (id: string, { data: { excalidraw, content } }: ActiveNote) => {
        return await prisma.notes.update({
            where: { id },
            data: { excalidraw, content },
        });
    };

    setInterval(() => {
        activeNotes.forEach(async (note, noteId) => {
            if (!note) return;

            if (note.lastUpdate < Date.now() - 1000 * 5) {
                await saveNote(noteId, note);
                activeNotes.delete(noteId);
                console.log(`${noteId} not updated in ${Math.floor((Date.now() - note.lastUpdate) / 1000)} seconds, saving`);
                return;
            }

            if (note.updates > 25) {
                await saveNote(noteId, note);
                activeNotes.delete(noteId);
                console.log(`Saving ${noteId} after ${note.updates} updates`);
                return;
            }
        });
    }, 1000 * 5);

    server.on("connection", (socket) => {
        socket.on("joinNote", ({ noteId }) => {
            if (!noteId) return;
            console.log("Joining note", noteId);
            socket.join(noteId);
        });

        socket.on("leaveNote", ({ noteId }) => {
            if (!noteId) return;
            socket.leave(noteId);
        });

        socket.on("getNote", async (id, callback) => {
            const activeNote = activeNotes.get(id);
            if (activeNote) {
                callback({ success: true, data: activeNote.data });
                return;
            }
            const note = await prisma.notes.findUnique({
                where: {
                    id,
                },
            });
            if (!note || note.deletedAt !== null || note.userId !== socket.handshake.auth.userId) {
                callback({ success: false, error: "Note not found" });
                return;
            }
            activeNotes.set(id, { data: note, lastUpdate: Date.now(), updates: 0 });
            callback({ success: true, data: note });
        });

        socket.on("noteUpdate", async ({ noteId, text }) => {
            if (!noteId) return;

            if (!activeNotes.has(noteId)) {
                const note = await prisma.notes.findUnique({
                    where: {
                        id: noteId,
                    },
                });
                if (!note) return;

                activeNotes.set(noteId, {
                    data: { ...note, content: text },
                    lastUpdate: Date.now(),
                    updates: 1,
                });

                socket.to(noteId).emit("noteChanged", { fromId: socket.id, data: { ...note, content: text } });

                console.log("Created new active note", noteId);
            } else {
                const note = activeNotes.get(noteId)!;
                note.data.content = text;
                note.lastUpdate = Date.now();
                note.updates++;
                socket.to(noteId).emit("noteChanged", { fromId: socket.id, data: note.data });
                console.log("Updated active note", noteId);
            }
        });

        socket.on("drawUpdate", async ({ noteId, value }) => {
            if (!noteId) return;

            if (!activeNotes.has(noteId)) {
                const note = await prisma.notes.findUnique({
                    where: {
                        id: noteId,
                    },
                });
                if (!note) return;

                activeNotes.set(noteId, {
                    data: { ...note, excalidraw: value },
                    lastUpdate: Date.now(),
                    updates: 1,
                });

                socket.to(noteId).emit("noteChanged", { fromId: socket.id, data: { ...note, excalidraw: value } });

                console.log("Created new active note", noteId);
            } else {
                const note = activeNotes.get(noteId)!;
                note.data.excalidraw = value;
                note.lastUpdate = Date.now();
                note.updates++;
                socket.to(noteId).emit("noteChanged", { fromId: socket.id, data: note.data });
            }
        });
    });

    // server.on("connection", (socket) => {
    //     console.log("New user connected to socket", socket.id);

    //     socket.on("joinNote", ({ noteId }) => {
    //         if (!noteId) return;
    //         socket.join(noteId);
    //         console.log(socket.id, "joined note", noteId);
    //     });

    //     socket.on("leaveNote", ({ noteId }) => {
    //         if (!noteId) return;
    //         socket.leave(noteId);
    //         console.log(socket.id, "left note", noteId);
    //     });

    //     socket.on("getNote", async (id, callback) => {
    //         console.log("getNote", id);
    //         if (!id) return;
    //         const activeNote = activeNotes.get(id);
    //         console.log("activeNote", activeNote);
    //         if (activeNote) {
    //             callback(activeNote.data);
    //             return;
    //         }
    //         const note = await prisma.notes.findUnique({
    //             where: {
    //                 id,
    //             },
    //         });
    //         if (!note) return;
    //         console.log("note", note);
    //         return note;
    //     });

    //     socket.on("noteUpdate", async ({ excalidraw, noteId, text }) => {
    //         if (!noteId) return;

    //         socket.to(noteId).emit("noteChanged", { fromId: socket.id, text, excalidraw });
    //         if (!activeNotes.has(noteId)) {
    //             const note = await prisma.notes.findUnique({
    //                 where: {
    //                     id: noteId,
    //                 },
    //             });
    //             if (!note) return;

    //             activeNotes.set(noteId, {
    //                 data: { ...note, excalidraw, content: text },
    //                 lastUpdate: Date.now(),
    //                 updates: 1,
    //             });

    //             console.log("Created new active note", noteId);
    //         } else {
    //             const note = activeNotes.get(noteId)!;
    //             console.log("Before upadte", note);
    //             note.data.excalidraw = excalidraw;
    //             note.data.content = text;
    //             note.lastUpdate = Date.now();
    //             note.updates++;
    //             console.log("after upadte", activeNotes);
    //         }
    //     });
    // });

    // server.on("connection", (socket) => {
    //     console.log("Connected", socket.id);

    //     socket.on("noteUpdate", async ({ noteId, text, excalidraw }) => {
    //         let _saveNote: Partial<NoteData> | undefined = noteData.get(noteId);
    //         console.log("Got note update", _saveNote);
    //         if (!_saveNote) {
    //             const saveDebouce = debouceSaveInit();
    //             _saveNote = {
    //                 debouce: saveDebouce,
    //                 lastData: {
    //                     content: text,
    //                     excalidraw,
    //                 },
    //             };
    //             console.log("Created new save debouce for ", noteId);
    //         }

    //         // Technically this doesnt meet the type requirements of NoteData
    //         // since force is not defined, but I dont care
    //         const saveNote = _saveNote as unknown as NoteData;
    //         socket.to(noteId).emit("noteChanged", { fromId: socket.id, text, excalidraw });
    //         const forceNoteSave = saveNote.debouce(noteId, { content: text });

    //         noteData.set(noteId, { ...saveNote, force: forceNoteSave });
    //     });

    //     socket.on("joinNote", ({ noteId }) => {
    //         socket.join(noteId);
    //         console.log("Joined note", noteId);
    //     });

    //     socket.on("leaveNote", ({ noteId }) => {
    //         socket.leave(noteId);
    //         if (!socket.rooms.has(noteId)) {
    //             const noteDate = noteData.get(noteId);
    //             if (noteDate) {
    //                 noteDate.force();
    //             }
    //         }
    //     });
    // });

    return server;
};
