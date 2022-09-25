import { Box, useColorModeValue } from "@chakra-ui/react";

const ErrorBox = ({ text }: { text: string }) => (
    <Box bg={useColorModeValue("red.500", "red.300")} boxShadow={"2xl"} rounded={"md"} m={6} p={6}>
        {text}
    </Box>
);

export default ErrorBox;
