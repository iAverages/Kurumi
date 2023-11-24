import { createQuery } from "@tanstack/solid-query";
import { User } from "../types/user";
import { env } from "../env";
import axios from "axios";
import { useSocket } from "../context/socket";

type UserQuery = {
    user: User;
};

export const useUser = () => {
    const socket = useSocket();

    return createQuery(() => ({
        queryKey: ["user", "me"],
        queryFn: async () => {
            const response = await axios.get<UserQuery>(`${env.VITE_API_URL}/api/v1/user/me`, {
                withCredentials: true,
            });
            console.log("[AUTH]: User is authenticated, connecting to socket");
            socket.manager.connect();
            return response.data.user;
        },
        retry: false,
        placeholderData: {
            email: "",
            id: "",
            name: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } satisfies User,
    }));
};
