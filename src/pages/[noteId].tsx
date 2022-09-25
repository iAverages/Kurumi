import { FC } from "react";
import Head from "next/head";
import Editor from "../components/editor";
import dbConnect from "../database/connect";
import Note, { INote } from "../database/models/Note";
import Nav from "../components/navbar";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
    IconButton,
    ButtonGroup,
    Flex,
    useEditableControls,
    EditablePreview,
    Editable,
    EditableInput,
    Input,
    Box,
    useColorModeValue,
} from "@chakra-ui/react";
import ErrorBox from "../components/errorBox";

interface NoteProps {
    note: INote;
    errored: boolean;
}

const NoteName: FC<{ note: INote }> = ({ note }) => {
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

    const EditableControls = () => {
        const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls();

        return isEditing ? (
            <ButtonGroup justifyContent="center" size="sm">
                {/* @ts-ignore - the docs say this works and it works? bad types?*/}
                <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
                {/* @ts-ignore */}
                <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
            </ButtonGroup>
        ) : (
            <Flex justifyContent="center">
                {/* @ts-ignore */}
                <IconButton size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
            </Flex>
        );
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

const NotePage = ({ note, errored }: NoteProps) => {
    return (
        <div style={{ height: "100%" }}>
            <Head>
                <title>{note.name}</title>
                <meta name="description" content={note.body?.substring(0, 50)} />
            </Head>
            <Nav title={<NoteName note={note} />} />
            {errored ? <ErrorBox text={"Error occured fetching note"} /> : <Editor content={note.body} />}
        </div>
    );
};

export async function getServerSideProps({ params }: any) {
    const connected = await dbConnect();
    let note: object = {};
    if (connected) {
        try {
            note = (await Note.findById(params.noteId)) ?? {};
        } catch (e) {
            // No note found
        }
    }
    return { props: { errored: !connected, note: JSON.parse(JSON.stringify(note)) } };
}

export default NotePage;
