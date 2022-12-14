// https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.js

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let dbName = "notes"
if (process.env.DB_NAME) {
    dbName = process.env.DB_NAME;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore - find out how to add to globalThis type
let cached = global.mongoose;

if (!cached) {
    // @ts-ignore
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                dbName,
                socketTimeoutMS: 10000,
                connectTimeoutMS: 10000,
            })
            .then((mongoose) => {
                console.log("Connected to mongo");
                return mongoose;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        // Failed to connect
        cached.conn = null;
        console.error("Failed to to connect to mongo");
        console.error(e);
    }

    return cached.conn;
}

export default dbConnect;
