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
    console.log("connected");
    console.log(socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
    });

    socket.on("offer", ({ offer, roomId }) => {
        socket.to(roomId).emit(offer);
    });

    socket.on("answer", ({ answer, roomId }) => {
        socket.to(roomId).emit(answer);
    });

    socket.on("ice-candidate", ({ ice, roomId }) => {
        socket.to(roomId).emit(ice);
    });
    // socket.on("connection",() =>{
    //     console.log()
    // });
});

httpServer.listen(3000);

// app.listen(3000, () => {
//     console.log("App listening on http://localhost:3000");
// });
