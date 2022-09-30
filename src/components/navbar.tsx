import { ReactNode } from "react";
import { FC } from "react";
import Link from "next/link";
import { useWebsocket } from "../hooks/useWebsocket";
import { MoonIcon, SunIcon, ArrowBackIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
    Box,
    Flex,
    Avatar,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Text,
} from "@chakra-ui/react";

interface IndexProps {
    title: string | ReactNode;
}

const Nav: FC<IndexProps> = ({ title }) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { connected } = useWebsocket();

    return (
        <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
            <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
                <Link href={"/"}>
                    <Button>{<ArrowBackIcon />}</Button>
                </Link>
                <Box>{title}</Box>

                <Flex alignItems={"center"}>
                    <Stack direction={"row"} spacing={7}>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    bg={connected ? "green.500" : "red.600"}
                                    _hover={{ bg: connected ? "green.700" : "red.700" }}
                                >
                                    {connected ? <CheckIcon /> : <CloseIcon />}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader>{connected ? "Connected" : "Disconnected"}</PopoverHeader>
                                <PopoverBody>
                                    {connected
                                        ? "Websocket connection is active, notes will work as excepted"
                                        : "Websocket disconnected. Notes will not update until connection is active again!"}
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={toggleColorMode}>{colorMode === "light" ? <MoonIcon /> : <SunIcon />}</Button>

                        <Menu>
                            <MenuButton as={Button} rounded={"full"} variant={"link"} cursor={"pointer"} minW={0}>
                                <Avatar size={"sm"} src={"https://cdn.avrg.dev/screenshots/pfp.jpg"} />
                            </MenuButton>
                            <MenuList alignItems={"center"}>
                                <br />
                                <Center>
                                    <Avatar size={"2xl"} src={"https://cdn.avrg.dev/screenshots/pfp.jpg"} />
                                </Center>
                                <br />
                                <Center>
                                    <p>dan</p>
                                </Center>
                                <br />
                                <MenuDivider />
                                <Text marginLeft={2}>Commit: {process.env.COMMIT_HASH}</Text>
                                <MenuDivider />
                                <MenuItem>Logout</MenuItem>
                            </MenuList>
                        </Menu>
                    </Stack>
                </Flex>
            </Flex>
        </Box>
    );
};

export default Nav;
