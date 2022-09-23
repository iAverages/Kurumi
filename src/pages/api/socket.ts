import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import Note from "../../database/models/Note";
import { debounce } from "../../helpers/debouce";
import { SocketEvents, TextUpdate } from "../../socketEvents";

interface NotesApiRequest {
    socket: {
        server: any;
    };
}

const noteSaveDebouceMap = new Map<string, (id: string, body: string) => void>();

const debouceSaveInit = () =>
    debounce(
        async (id: string, body: string) => {
            await Note.findByIdAndUpdate(id, { body });
            console.log("Saved note:", id);
            noteSaveDebouceMap.delete(id);
        },
        2000,
        10000
    );

// TODO: Clean up a bit?
// Starts websocket server
// Is there a better way to do this?
// I dont like it lol
const handle = (req: NextApiRequest, res: NotesApiRequest & NextApiResponse) => {
    if (res.socket.server.io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log("Connected", socket.id);
            socket.on(SocketEvents.TextUpdate, async ({ noteId, text }: TextUpdate) => {
                let saveNote = noteSaveDebouceMap.get(noteId);
                if (!saveNote) {
                    saveNote = debouceSaveInit();
                    noteSaveDebouceMap.set(noteId, saveNote);
                    console.log("Created new save debouce for ", noteId);
                }

                socket.to(noteId).emit(SocketEvents.TextChanged, { fromId: socket.id, text });
                saveNote(noteId, text);
            });

            socket.on(SocketEvents.UpdateNoteId, (room) => {
                console.log(socket.id, "joined", room);
                socket.join(room);
            });

            socket.on(SocketEvents.LeaveNote, (room) => {
                console.log(socket.id, "left", room);
                socket.leave(room);
            });

            socket.on(SocketEvents.Disconnect, () => {
                console.log("disconnected", socket.id);
            });
        });
    }
    res.end();
};

export default handle;
