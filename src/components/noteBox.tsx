import { Heading, Box, Text, Flex, Center, useColorModeValue, Avatar, Stack, Spacer } from "@chakra-ui/react";
import { FC } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Button, useToast } from "@chakra-ui/react";
import { Notes } from "@prisma/client";

const NoteBox: FC<{ note: Notes }> = ({ note }) => {
    const toast = useToast();
    // const handleClick = () => Router.push(`/${note._id}`);

    // const handleDelete = async () => {
    //     const response = await fetch("/api/note", {
    //         method: "DELETE",
    //         body: JSON.stringify({
    //             id: note._id,
    //         }),
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     }).then((res) => res.json());
    //     const success = response.success;
    //     toast({
    //         status: success ? "success" : "error",
    //         title: success ? "Note was successfully deleted" : "Failed to delete note.",
    //         isClosable: true,
    //     });
    // };

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
                        <Button
                            alignSelf={"self-end"}
                            _hover={{ bg: "red.300" }}
                            //onClick={handleDelete}>
                        >
                            {<DeleteIcon />}
                        </Button>
                    </Flex>
                    <Heading
                        color={useColorModeValue("gray.700", "white")}
                        fontSize={"2xl"}
                        fontFamily={"body"}
                        // onClick={handleClick}
                        _hover={{ cursor: "pointer" }}
                    >
                        {note.id}
                    </Heading>
                    <Text color={"gray.500"}>{(note.content === "" ? "Note is empty" : note.content).substring(0, 50)}</Text>
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
