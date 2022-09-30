import Head from "next/head";
import Editor from "../components/editor";
import dbConnect from "../database/connect";
import Note, { INote } from "../database/models/Note";
import Nav from "../components/navbar";
import ErrorBox from "../components/errorBox";
import NoteTitle from "../components/NoteTitle";
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface NoteProps {
    note: INote;
    errored: boolean;
}

const NotePage = ({ note, errored }: NoteProps) => {
    const [title, setTitle] = useState(note.name);

    useEffect(() => setTitle(note.name?.substring(0, 50) + " | Kurumi"), [note, note.name]);

    return (
        <div style={{ height: "100%" }}>
            <Head>
                <title>{title}</title>
                <meta name="description" content={note.body?.substring(0, 150) ?? "Note has no body"} />
            </Head>
            <Box h={"100%"}>
                <Nav title={<NoteTitle note={note} />} />
                {errored ? <ErrorBox text={"Error occured fetching note"} /> : <Editor content={note.body} />}
            </Box>
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
