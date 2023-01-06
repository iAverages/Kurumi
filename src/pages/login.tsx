import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useBreakpointValue,
    useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { OAuthButtonGroup } from "../components/oAuthButtonGroup";
import { signIn } from "next-auth/react";
import { useState } from "react";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");

    return (
        <Container maxW="lg" py={{ base: "12", md: "24" }} px={{ base: "0", sm: "8" }}>
            <Stack spacing="8">
                <Stack spacing="6">
                    <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
                        <Heading size={useBreakpointValue({ base: "xs", md: "sm" })}>Log in to your account</Heading>
                    </Stack>
                </Stack>
                <Box
                    py={{ base: "0", sm: "8" }}
                    px={{ base: "4", sm: "10" }}
                    bg={useBreakpointValue({ base: "transparent", sm: "bg-surface" })}
                    boxShadow={{ base: "none", sm: useColorModeValue("md", "md-dark") }}
                    borderRadius={{ base: "none", sm: "xl" }}
                >
                    <Stack spacing="6">
                        <Stack spacing="5">
                            <FormControl>
                                <FormLabel htmlFor="email">Magic Email Link</FormLabel>
                                <Input id="email" type="email" onChange={(e) => setEmail(e.target.value)} />
                            </FormControl>
                            <Button colorScheme="purple" onClick={() => signIn("email", { email })}>
                                Sign in
                            </Button>
                        </Stack>
                        <Stack spacing="2">
                            <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
                                <Heading size={"xs"}>Or login with</Heading>
                            </Stack>
                            <Divider />
                            <OAuthButtonGroup />
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Container>
    );
};

export default Login;
