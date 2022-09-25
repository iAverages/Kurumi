import { model, models, Schema, Document, Model } from "mongoose";

export interface INote extends Document {
    name: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    archived: boolean;
}

export const noteSchema = new Schema<INote>(
    {
        name: { type: String, required: true, trim: true },
        body: { type: String, default: "", trim: true },
        archived: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Note = models.Note || model<INote>("Note", noteSchema);

export default Note as Model<INote>;
