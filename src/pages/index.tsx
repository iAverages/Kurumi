import { FC } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { DeleteIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import Router from "next/router";
import Nav from "../components/navbar";
import Note, { INote } from "../database/models/Note";
import { Heading, Box, Text, Flex, Center, useColorModeValue, Avatar, Stack, Spacer, SimpleGrid } from "@chakra-ui/react";
import dbConnect from "../database/connect";
import ErrorBox from "../components/errorBox";

const NoteBox: FC<{ note: INote }> = ({ note }) => {
    const handleClick = () => Router.push(`/${note._id}`);
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
                        <Button alignSelf={"self-end"} _hover={{ bg: "red.300" }}>
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

const Home: NextPage<{ notes: INote[]; errored: boolean }> = ({ notes, errored }) => {
    const handleCreateNote = async () => {
        const response = await fetch("/api/note", {
            method: "POST",
        }).then((res) => res.json());
        Router.push(response._id);
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
                        <Heading>Your Notes</Heading>
                        <Button colorScheme="purple" onClick={handleCreateNote}>
                            Create Note
                        </Button>
                        <SimpleGrid minChildWidth="445px" w={"100%"} spacing="1rem">
                            {notes?.map((note, idx) => (
                                <NoteBox key={idx} note={note} />
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
    const notes = connected ? await Note.find({}) : [];
    return { props: { errored: !connected, notes: JSON.parse(JSON.stringify(notes)) } };
}

export default Home;
