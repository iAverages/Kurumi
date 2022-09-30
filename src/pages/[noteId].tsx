import Head from "next/head";
import Editor from "../components/editor";
import dbConnect from "../database/connect";
import Note, { INote } from "../database/models/Note";
import Nav from "../components/navbar";
import ErrorBox from "../components/errorBox";
import NoteTitle from "../components/NoteTitel";

interface NoteProps {
    note: INote;
    errored: boolean;
}

const NotePage = ({ note, errored }: NoteProps) => {
    return (
        <div style={{ height: "100%" }}>
            <Head>
                <title>{note.name.substring(0, 50)} | Kurumi</title>
                <meta name="description" content={note.body?.substring(0, 150) ?? "Note has no body"} />
            </Head>
            <Nav title={<NoteTitle note={note} />} />
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
