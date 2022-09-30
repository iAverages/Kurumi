import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { IconButton, ButtonGroup, Flex, useEditableControls } from "@chakra-ui/react";

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

export default EditableControls;
