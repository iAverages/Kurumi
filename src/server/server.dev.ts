import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from "../types/websocket.events";
import { initWebsocketServer } from "./websocket";

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

initWebsocketServer(io);
io.listen(3001);

console.log("Listening on port 3001");
