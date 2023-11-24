import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    clientPrefix: "VITE_",
    client: {
        VITE_API_URL: z.string().min(1),
    },
    runtimeEnv: (import.meta as any).env,
});
