import { createQuery } from "@tanstack/solid-query";
import axios from "axios";
import { Note } from "../types/notes";
import { env } from "../env";

export const useNotesList = () => {
    return createQuery(() => ({
        queryKey: ["notes", "list"],
        queryFn: async () => {
            const response = await axios.get<{ notes: Note[] }>(`${env.VITE_API_URL}/api/v1/notes`, {
                withCredentials: true,
            });

            return response.data.notes;
        },
    }));
};
