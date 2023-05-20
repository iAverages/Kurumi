import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.preprocess(
        // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
        // Since NextAuth automatically uses the VERCEL_URL if present.
        (str) => process.env.VERCEL_URL ?? str,
        // VERCEL_URL doesnt include `https` so it cant be validated as a URL
        process.env.VERCEL ? z.string() : z.string().url()
    ),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    EMAIL_SERVER_HOST: z.string(),
    EMAIL_SERVER_PORT: z.string(),
    EMAIL_SERVER_SECURE: z.string(),
    EMAIL_SERVER_USER: z.string(),
    EMAIL_SERVER_PASSWORD: z.string(),
    EMAIL_FROM: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {    
    NEXT_PUBLIC_WS_URL: z.string().url(),
    NEXT_PUBLIC_COMMIT_HASH: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_COMMIT_HASH: process.env.NEXT_PUBLIC_COMMIT_HASH,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_SECURE: process.env.EMAIL_SERVER_SECURE,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});


// import { z } from "zod";

// /**
//  * Specify your server-side environment variables schema here. This way you can ensure the app isn't
//  * built with invalid env vars.
//  */
// const server = z.object({
    // DATABASE_URL: z.string().url(),
    // NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // NEXTAUTH_SECRET: z.string(),
    // NEXTAUTH_URL: z.preprocess(
    //     // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    //     // Since NextAuth automatically uses the VERCEL_URL if present.
    //     (str) => process.env.VERCEL_URL ?? str,
    //     // VERCEL_URL doesnt include `https` so it cant be validated as a URL
    //     process.env.VERCEL ? z.string() : z.string().url()
    // ),
    // DISCORD_CLIENT_ID: z.string(),
    // DISCORD_CLIENT_SECRET: z.string(),
    // GITHUB_CLIENT_ID: z.string(),
    // GITHUB_CLIENT_SECRET: z.string(),
    // EMAIL_SERVER_HOST: z.string(),
    // EMAIL_SERVER_PORT: z.string(),
    // EMAIL_SERVER_SECURE: z.string(),
    // EMAIL_SERVER_USER: z.string(),
    // EMAIL_SERVER_PASSWORD: z.string(),
    // EMAIL_FROM: z.string(),
// });

// /**
//  * Specify your client-side environment variables schema here. This way you can ensure the app isn't
//  * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
//  */
// const client = z.object({
    // NEXT_PUBLIC_WS_URL: z.string().url(),
    // NEXT_PUBLIC_COMMIT_HASH: z.string().optional(),
// });

// /**
//  * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
//  * middlewares) or client-side so we need to destruct manually.
//  *
//  * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
//  */
// const processEnv = {
    // NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    // NEXT_PUBLIC_COMMIT_HASH: process.env.NEXT_PUBLIC_COMMIT_HASH,
    // DATABASE_URL: process.env.DATABASE_URL,
    // NODE_ENV: process.env.NODE_ENV,
    // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    // DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    // GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    // GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    // EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    // EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    // EMAIL_SERVER_SECURE: process.env.EMAIL_SERVER_SECURE,
    // EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    // EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    // EMAIL_FROM: process.env.EMAIL_FROM,
// };

// // Don't touch the part below
// // --------------------------

// const merged = server.merge(client);

// /** @typedef {z.input<typeof merged>} MergedInput */
// /** @typedef {z.infer<typeof merged>} MergedOutput */
// /** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

// let env = /** @type {MergedOutput} */ (process.env);

// if (!!process.env.SKIP_ENV_VALIDATION == false) {
//     const isServer = typeof window === "undefined";

//     const parsed = /** @type {MergedSafeParseReturn} */ (
//         isServer
//             ? merged.safeParse(processEnv) // on server we can validate all env vars
//             : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
//     );

//     if (parsed.success === false) {
//         console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
//         throw new Error("Invalid environment variables");
//     }

//     env = new Proxy(parsed.data, {
//         get(target, prop) {
//             if (typeof prop !== "string") return undefined;
//             // Throw a descriptive error if a server-side env var is accessed on the client
//             // Otherwise it would just be returning `undefined` and be annoying to debug
//             if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
//                 throw new Error(
//                     process.env.NODE_ENV === "production"
//                         ? "❌ Attempted to access a server-side environment variable on the client"
//                         : `❌ Attempted to access server-side environment variable '${prop}' on the client`
//                 );
//             return target[/** @type {keyof typeof target} */ (prop)];
//         },
//     });
// }

// export { env };
