import type { NextPage } from "next";
import Head from "next/head";
import { Button, useToast } from "@chakra-ui/react";
import Router from "next/router";
import Nav from "../components/navbar";
import { Heading, Box, SimpleGrid } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import NoteBox from "../components/noteBox";
import { Show } from "../components/show";

const Home: NextPage = () => {
    const {
        data,
        error: errored,
        fetchNextPage,
        hasNextPage,
    } = trpc.notes.getNotes.useInfiniteQuery(
        { orderBy: "desc", limit: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );
    const createNote = trpc.notes.createNote.useMutation();
    const toast = useToast();

    const handleCreateNote = async () => {
        const note = await createNote.mutateAsync();
        Router.push(note.id);
        toast({
            title: "Note created",
        });
    };

    return (
        <>
            <Head>
                <title>Notes</title>
                <meta name="description" content="Note taking app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Nav title="Your Notes" />
            <Box paddingInline={"2rem"}>
                {errored ? (
                    <div>Error occured fetching notes</div>
                ) : (
                    <>
                        <Box display={"flex"} gap={"1rem"} mt={"1rem"} alignContent={"center"}>
                            <Heading>Your Notes</Heading>
                            <Button colorScheme="purple" onClick={handleCreateNote}>
                                Create Note
                            </Button>
                        </Box>
                        <SimpleGrid minChildWidth="445px" w={"100%"} spacing="1rem">
                            <Show when={data}>
                                {({ pages }) => (
                                    <>
                                        {pages.map(({ items }, page) => (
                                            <>
                                                {items.map((note, idx) => (
                                                    <NoteBox key={`${page}-${idx}`} note={note} />
                                                ))}
                                            </>
                                        ))}
                                    </>
                                )}
                            </Show>
                        </SimpleGrid>

                        <Button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
                            Load More Notes
                        </Button>
                    </>
                )}
            </Box>
        </>
    );
};

export default Home;
