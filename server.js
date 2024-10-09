import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";

import { Server } from "socket.io";
// notice that the result of `remix vite:build` is "just a module"
import * as build from "./build/server/index.js";

const app = express();
app.use(express.static("build/client"));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));
const httpServer = createServer(app);

const io = new Server(httpServer, {});

io.on("connection", (socket) => {
    socket.on("join-room", (data) => {
        const { roomId } = data;
        console.log("joined room ", roomId);
        socket.join(roomId);
    });

    socket.on("offer", (offer, data) => {
        console.log("offer");
        const { roomId } = data;
        console.log(data);
        console.log(roomId);
        console.log(offer);
        socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", (answer, data) => {
        const { roomId } = data;
        console.log(roomId);
        console.log(answer);
        socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", (ice, data) => {
        const { roomId } = data;
        console.log(roomId);
        console.log(ice);
        socket.to(roomId).emit("ice-candidate", ice);
    });
});

httpServer.listen(3000, () => console.log("listening in 3000...."));
