import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { IconButton, ButtonGroup, Flex, useEditableControls } from "@chakra-ui/react";

import { EditablePreview, Editable, EditableInput, Input } from "@chakra-ui/react";
import { Notes } from "@prisma/client";
import { trpc } from "~/utils/trpc";

const EditableControls = () => {
    const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls();

    return isEditing ? (
        <ButtonGroup justifyContent="center" size="sm">
            {/* @ts-ignore - the docs say this works and it works? bad types?*/}
            <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
            {/* @ts-ignore */}
            <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
        </ButtonGroup>
    ) : (
        <Flex justifyContent="center">
            {/* @ts-ignore */}
            <IconButton size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
        </Flex>
    );
};

const NoteTitle = ({ note }: { note: Notes }) => {
    const { mutate } = trpc.notes.updateNoteTitle.useMutation();

    return (
        <Editable
            textAlign="center"
            alignItems={"center"}
            display={"flex"}
            gap={"1rem"}
            defaultValue={note.title}
            fontSize="2xl"
            isPreviewFocusable={false}
            onSubmit={(change) => mutate({ noteId: note.id, title: change })}
        >
            <EditablePreview />
            <Input as={EditableInput} />
            <EditableControls />
        </Editable>
    );
};

export default NoteTitle;
