export enum SocketEvents {
    TextUpdate = "text-update",
    TextChanged = "text-changed",
    UpdateNoteId = "update-note-id",
    LeaveNote = "leave-note",
    Connect = "connect",
    Disconnect = "disconnect",
}

export interface TextUpdate {
    noteId: string;
    text: string;
}

export interface TextChanged {
    fromId: string;
    text: string;
}
