import { FC, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { DeleteIcon } from "@chakra-ui/icons";
import { Button, useToast } from "@chakra-ui/react";
import Router from "next/router";
import Nav from "../components/navbar";
import Note, { INote } from "../database/models/Note";
import { Heading, Box, Text, Flex, Center, useColorModeValue, Avatar, Stack, Spacer, SimpleGrid } from "@chakra-ui/react";
import dbConnect from "../database/connect";
import ErrorBox from "../components/errorBox";

const NoteBox: FC<{ note: INote; removeNote: (id: string) => void }> = ({ note, removeNote }) => {
    const toast = useToast();
    const handleClick = () => Router.push(`/${note._id}`);

    const handleDelete = async () => {
        const response = await fetch("/api/note", {
            method: "DELETE",
            body: JSON.stringify({
                id: note._id,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json());
        const success = response.success;
        toast({
            status: success ? "success" : "error",
            title: success ? "Note was successfully deleted" : "Failed to delete note.",
            isClosable: true,
        });
        removeNote(note._id);
    };

    return (
        <Center py={6}>
            <Box
                maxH={"255px"}
                h={"full"}
                w={"full"}
                bg={useColorModeValue("white", "gray.900")}
                boxShadow={"2xl"}
                rounded={"md"}
                p={6}
                overflow={"hidden"}
            >
                <Stack>
                    <Flex>
                        <Text
                            color={"green.500"}
                            textTransform={"uppercase"}
                            fontWeight={800}
                            fontSize={"sm"}
                            letterSpacing={1.1}
                            alignSelf={"center"}
                        >
                            Private
                        </Text>
                        <Spacer />
                        <Button alignSelf={"self-end"} _hover={{ bg: "red.300" }} onClick={handleDelete}>
                            {<DeleteIcon />}
                        </Button>
                    </Flex>
                    <Heading
                        color={useColorModeValue("gray.700", "white")}
                        fontSize={"2xl"}
                        fontFamily={"body"}
                        onClick={handleClick}
                        _hover={{ cursor: "pointer" }}
                    >
                        {note.name}
                    </Heading>
                    <Text color={"gray.500"}>{(note.body === "" ? "Note is empty" : note.body).substring(0, 50)}</Text>
                </Stack>
                <Stack mt={6} direction={"row"} spacing={4} align={"center"}>
                    {/* These are just temp until i setup accounts */}
                    <Avatar src={"https://cdn.avrg.dev/screenshots/pfp.jpg"} />
                    <Stack direction={"column"} spacing={0} fontSize={"sm"}>
                        <Text fontWeight={600}>dan</Text>
                        <Text color={"gray.500"}>{new Date(note.createdAt).toDateString()}</Text>
                    </Stack>
                </Stack>
            </Box>
        </Center>
    );
};

const Home: NextPage<{ _notes: INote[]; errored: boolean }> = ({ _notes, errored }) => {
    const [notes, setNotes] = useState<INote[]>(_notes ?? []);

    useEffect(() => {
        setNotes(_notes);
    }, [_notes]);

    const handleCreateNote = async () => {
        const response = await fetch("/api/note", {
            method: "POST",
        }).then((res) => res.json());
        Router.push(response._id);
    };

    const removeNote = (id: string) => {
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
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
                    <ErrorBox text={"Error occured fetching notes"} />
                ) : (
                    <>
                        <Box display={"flex"} gap={"1rem"} mt={"1rem"} alignContent={"center"}>
                            <Heading>Your Notes</Heading>
                            <Button colorScheme="purple" onClick={handleCreateNote}>
                                Create Note
                            </Button>
                        </Box>
                        <SimpleGrid minChildWidth="445px" w={"100%"} spacing="1rem">
                            {notes?.map((note, idx) => (
                                // Change this "removeNote"?
                                <NoteBox key={idx} note={note} removeNote={removeNote} />
                            ))}
                        </SimpleGrid>
                    </>
                )}
            </Box>
        </>
    );
};

export async function getServerSideProps() {
    const connected = await dbConnect();
    const notes = connected
        ? await Note.find({
              $or: [{ archived: { $exists: false } }, { archived: false }],
          })
        : [];
    return { props: { errored: !connected, _notes: JSON.parse(JSON.stringify(notes.reverse())) } };
}

export default Home;
