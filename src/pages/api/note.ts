import { NextApiRequest, NextApiResponse } from "next";
import Note from "../../database/models/Note";

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const newNote = new Note({ name: "New Note" });
        const note = await newNote.save();
        return res.send(note);
    } catch (e) {
        console.log(e);
        return res.status(500);
    }
};

// TODO: Need to finish to update name and allow for body updates too
const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!req.body.id) {
            return res.status(400).send({ success: false, message: "ID is required" });
        }
        if (!req.body.name && req.body.body) {
            return res.status(400).send({ success: false, message: "Either name or body is required" });
        }

        const update: Record<string, string> = {};
        if (req.body.name) update.name = req.body.name;
        if (req.body.body) update.body = req.body.body;

        const note = await Note.updateOne({ _id: req.body.id }, update);
        const success = note.modifiedCount > 0;
        if (success) {
            console.log(`Note ${req.body.id} was updated`);
        }
        return res.send({ success });
    } catch (e) {
        console.log(e);
        return res.status(500);
    }
};

// TODO: Implement "recently deleted"
const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!req.body.id) {
            return res.status(400).send({ success: false, message: "ID is required" });
        }
        const note = await Note.updateOne({ _id: req.body.id }, { archived: true });
        const success = note.modifiedCount > 0;
        if (note.modifiedCount > 0) {
            console.log(`Note ${req.body.id} was archived`);
        }
        return res.send({ success });
    } catch (e) {
        console.log(e);
        return res.status(500);
    }
};

const handlers: Record<string, (req: NextApiRequest, res: NextApiResponse) => void> = {
    POST,
    DELETE,
    PATCH,
};

const handle = (req: NextApiRequest, res: NextApiResponse) => {
    const handle = handlers[req.method ?? "GET"];
    return handle ? handle(req, res) : res.status(404).send("");
};

export default handle;
