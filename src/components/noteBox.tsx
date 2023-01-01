import { Heading, Box, Text, Flex, Center, useColorModeValue, Avatar, Stack, Spacer } from "@chakra-ui/react";
import { FC } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Button, useToast } from "@chakra-ui/react";
import { Notes, User } from "@prisma/client";
import { useRouter } from "next/router";

const NoteBox: FC<{
    note: Notes & {
        user: User;
    };
}> = ({ note }) => {
    const toast = useToast();
    const router = useRouter();

    const handleClick = () => router.push(`/${note.id}`);

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
                        onClick={handleClick}
                        _hover={{ cursor: "pointer" }}
                    >
                        {note.title}
                    </Heading>
                    <Text color={"gray.500"}>{(note.content === "" ? "Note is empty" : note.content).substring(0, 50)}</Text>
                </Stack>
                <Stack mt={6} direction={"row"} spacing={4} align={"center"}>
                    <Avatar src={note.user.image ?? ""} />
                    <Stack direction={"column"} spacing={0} fontSize={"sm"}>
                        <Text fontWeight={600}>{note.user.name ?? "No Name"}</Text>
                        <Text color={"gray.500"}>{new Date(note.createdAt).toDateString()}</Text>
                    </Stack>
                </Stack>
            </Box>
        </Center>
    );
};

export default NoteBox;
