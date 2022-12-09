import type { NextPage } from "next";
import Head from "next/head";
import { Button, useToast } from "@chakra-ui/react";
import Router from "next/router";
// import Nav from "../components/navbar";
import { Heading, Box, SimpleGrid } from "@chakra-ui/react";

const Home: NextPage = () => {
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
            {/* <Nav title="Your Notes" /> */}
            <Box paddingInline={"2rem"}>
                {/* {errored ? (
                    <ErrorBox text={"Error occured fetching notes"} />
                ) : ( */}
                <>
                    <Box display={"flex"} gap={"1rem"} mt={"1rem"} alignContent={"center"}>
                        <Heading>Your Notes</Heading>
                        <Button colorScheme="purple" onClick={handleCreateNote}>
                            Create Note
                        </Button>
                    </Box>
                    <SimpleGrid minChildWidth="445px" w={"100%"} spacing="1rem">
                        {/* {notes?.map((note, idx) => (
                                // Change this "removeNote"?
                                <NoteBox key={idx} note={note} removeNote={removeNote} />
                            ))} */}
                    </SimpleGrid>
                </>
                {/* )} */}
            </Box>
        </>
    );
};

export default Home;
