import type { NextPage } from "next";
import { Button, ButtonGroup, Portal, useOutsideClick, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Nav from "~/components/navbar";
import { Heading, Box, SimpleGrid } from "@chakra-ui/react";
import { trpc } from "~/utils/trpc";
import NoteBox from "~/components/noteBox";
import { Show } from "~/components/show";
import PageSpinner from "~/components/PageSpinner";
import { Fragment, useRef, useState } from "react";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Text,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
} from "@chakra-ui/react";
import useBoolean from "~/hooks/useBoolean";

const Home: NextPage = () => {
    const toast = useToast();
    const router = useRouter();
    const { value: isSettingsOpen, off: closeSettings, toggle: toggleSettings } = useBoolean();
    const [limit, setLimit] = useState(25);
    const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
    const [sortSettings, setSortSettings] = useState({ orderBy, limit });
    const settingsModalRef = useRef<HTMLElement>(null);

    useOutsideClick({
        ref: settingsModalRef,
        handler: closeSettings,
    });

    const createNote = trpc.notes.createNote.useMutation();

    const {
        data,
        error: fetchNotesErrored,
        fetchNextPage,
        refetch,
        hasNextPage,
        isInitialLoading,
    } = trpc.notes.getNotes.useInfiniteQuery(sortSettings, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const hasSettingsChanged = sortSettings.orderBy !== orderBy || sortSettings.limit !== limit;

    const handleCreateNote = async () => {
        const note = await createNote.mutateAsync();
        await router.push(note.id);
        toast({
            title: "Note created",
        });
    };

    return (
        <>
            <Nav title="Your Notes" />
            <Box paddingInline={"2rem"}>
                <Show when={!isInitialLoading} fallback={<PageSpinner />}>
                    <Show
                        when={!fetchNotesErrored}
                        fallback={
                            <div>
                                <div>Error occured fetching notes</div>
                                <Button onClick={() => refetch()}>Retry</Button>
                            </div>
                        }
                    >
                        <>
                            <Show when={data}>
                                <Box display={"flex"} gap={"1rem"} mt={"1rem"} alignContent={"center"}>
                                    <Heading>Your Notes</Heading>
                                    <Button colorScheme="purple" onClick={handleCreateNote}>
                                        Create Note
                                    </Button>

                                    <Popover isOpen={isSettingsOpen}>
                                        <PopoverTrigger>
                                            <Button onClick={toggleSettings}>Settings</Button>
                                        </PopoverTrigger>
                                        <Portal>
                                            <PopoverContent ref={settingsModalRef}>
                                                <PopoverArrow />
                                                <PopoverHeader>View settings</PopoverHeader>
                                                <PopoverCloseButton />
                                                <PopoverBody className={"grid grid-cols-2 gap-2"}>
                                                    <Text className={"flex items-center"}>Limit</Text>
                                                    <NumberInput
                                                        defaultValue={25}
                                                        min={1}
                                                        max={50}
                                                        maxW="75px"
                                                        onChange={(_, num) => setLimit(num)}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                    <Text className={"flex items-center"}>Order By</Text>
                                                    <ButtonGroup>
                                                        <Button
                                                            onClick={() => setOrderBy("asc")}
                                                            colorScheme={orderBy === "asc" ? "blue" : "gray"}
                                                        >
                                                            Asc
                                                        </Button>
                                                        <Button
                                                            onClick={() => setOrderBy("desc")}
                                                            colorScheme={orderBy === "desc" ? "blue" : "gray"}
                                                        >
                                                            Desc
                                                        </Button>
                                                    </ButtonGroup>
                                                </PopoverBody>
                                                <PopoverFooter className={"flex gap-2"}>
                                                    <Button
                                                        colorScheme="green"
                                                        onClick={() => {
                                                            setSortSettings({ orderBy, limit });
                                                        }}
                                                        disabled={!hasSettingsChanged}
                                                    >
                                                        Apply
                                                    </Button>
                                                    <Button colorScheme="gray" disabled={!hasSettingsChanged}>
                                                        Reset
                                                    </Button>
                                                </PopoverFooter>
                                            </PopoverContent>
                                        </Portal>
                                    </Popover>
                                </Box>
                            </Show>
                            <SimpleGrid minChildWidth="445px" w={"100%"} spacing="1rem">
                                <Show
                                    when={data}
                                    fallback={
                                        <div className={"flex w-full flex-col items-center justify-center gap-2"}>
                                            <Heading size={"xl"}>No Notes Found</Heading>
                                            <p>Click below to create your first note!</p>
                                            <Button colorScheme="purple" onClick={handleCreateNote}>
                                                Create First Note
                                            </Button>
                                        </div>
                                    }
                                >
                                    {({ pages }) => (
                                        <>
                                            {pages.map(({ items }, page) => (
                                                <Fragment key={page}>
                                                    {items.map((note, idx) => (
                                                        <NoteBox key={`${page}-${idx}`} note={note} />
                                                    ))}
                                                </Fragment>
                                            ))}
                                        </>
                                    )}
                                </Show>
                            </SimpleGrid>

                            <Show when={data}>
                                <Button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
                                    Load More Notes
                                </Button>
                            </Show>
                        </>
                    </Show>
                </Show>
            </Box>
        </>
    );
};

export default Home;
