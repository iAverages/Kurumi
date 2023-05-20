import { env as _env } from "../env.mjs";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "../types/websocket.events";
import { initWebsocketServer } from "./websocket";

const isDev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000");

const httpServer = createServer();
const app = next({ dev: isDev, hostname, port, httpServer });
const handle = app.getRequestHandler();
const wsServer = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer);

app.prepare().then(() => {
    initWebsocketServer(wsServer);
    httpServer
        .on("request", async (req, res) => {
            try {
                const parsedUrl = parse(req.url ?? "", true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error("Error occurred handling", req.url, err);
                res.statusCode = 500;
                res.end("internal server error");
            }
        })
        .on("listening", () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        })
        .listen(port);
});
