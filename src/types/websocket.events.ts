import { Notes } from "@prisma/client";

export type NoteUpdate = { noteId: string; text: string };

export type DrawUpdate = { noteId: string; value: string };

export type NoteChanged = { fromId: string; data: Notes };

export type DrawChanged = { fromId: string; value: string };

// TODO: Needs a better name
export type ActiveNoteUpdate = { noteId: string };

export type ServerToClientEvents = {
    noteChanged: (data: NoteChanged) => void;
};

type SuccessResponse<T> = {
    success: true;
    data: T;
};

type ErrorResponse = {
    success: false;
    error?: string;
};

type Response<T> = SuccessResponse<T> | ErrorResponse;

export type ClientToServerEvents = {
    noteUpdate: (data: NoteUpdate) => void;
    drawUpdate: (data: DrawUpdate) => void;
    updateNoteId: (data: string) => void;
    joinNote: (data: ActiveNoteUpdate) => void;
    leaveNote: (data: ActiveNoteUpdate) => void;
    getNote: (data: string, callback: (response: Response<Notes>) => void) => void;
};

export type InterServerEvents = {
    ping: () => void;
};

export type SocketData = Record<string, unknown>;
