import { FC } from "react";
import { INote } from "../database/models/Note";
import { EditablePreview, Editable, EditableInput, Input } from "@chakra-ui/react";
import EditableControls from "../components/EditableControls";

const NoteTitle: FC<{ note: INote }> = ({ note }) => {
    const handleNameUpdate = (newName: string) => {
        try {
            // TODO: Change to use websocket so I can broadcast
            // to other clients viewing the note
            console.log({
                name: newName,
                id: note,
            });
            fetch("/api/note", {
                method: "PATCH",
                body: JSON.stringify({
                    name: newName,
                    id: note._id,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (e) {}
    };

    return (
        <Editable
            textAlign="center"
            alignItems={"center"}
            display={"flex"}
            defaultValue={note.name}
            fontSize="2xl"
            isPreviewFocusable={false}
            onSubmit={handleNameUpdate}
        >
            <EditablePreview />
            <Input as={EditableInput} />
            <EditableControls />
        </Editable>
    );
};

export default NoteTitle;
