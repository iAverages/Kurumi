import { useRouter } from "next/router";
import Editor from "../components/editor";
import Nav from "../components/navbar";
import useBoolean from "../hooks/useBoolean";
import { trpc } from "../utils/trpc";

const Note = () => {
    const router = useRouter();
    const { value: usingExcalidraw, on: enableExcalidraw, off: disableExcalidraw } = useBoolean();
    const { noteId } = router.query;
    const { data } = trpc.notes.getNote.useQuery(
        { id: noteId as string },
        {
            enabled: !!noteId,
            refetchOnWindowFocus: false,
            refetchInterval: false,
            refetchOnMount: true,
            refetchOnReconnect: false,
        }
    );

    return (
        <>
            <Nav
                title={data?.title || "Untitled"}
                icons={
                    <>
                        <button onClick={enableExcalidraw}>Excalidraw</button>
                        <button onClick={disableExcalidraw}>Markdown</button>
                    </>
                }
            />
            <main className=" flex min-h-screen flex-col bg-black ">
                <div className="h-screen">
                    {data && <Editor data={data} showExcalidraw={usingExcalidraw} />}
                    {!data && <div className="text-white">Loading...</div>}
                </div>
            </main>
        </>
    );
};

export default Note;
