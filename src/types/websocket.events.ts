export type TextUpdate = { noteId: string; text: string };

export type DrawUpdate = { noteId: string; value: string };

export type TextChanged = { fromId: string; text: string };

export type DrawChanged = { fromId: string; value: string };

export type ActiveNoteUpdate = { noteId: string };

export type ServerToClientEvents = {
    textChanged: (data: TextChanged) => void;
    drawChanged: (data: DrawChanged) => void;
};

export type ClientToServerEvents = {
    textUpdate: (data: TextUpdate) => void;
    drawUpdate: (data: DrawUpdate) => void;
    updateNoteId: (data: string) => void;
    joinNote: (data: ActiveNoteUpdate) => void;
    leaveNote: (data: ActiveNoteUpdate) => void;
};

export type InterServerEvents = {
    ping: () => void;
};

export type SocketData = Record<string, unknown>;
