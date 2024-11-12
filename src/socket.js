import { Server } from "socket.io";
import { authenticateSocket } from "./middlewares/authentication.js";

// {
//     cors: {
//         origin: [
//             "http://localhost:5173",
//             "https://meetx-dwcw.onrender.com",
//             "http://localhost:3000",
//         ],
//         methods: ["GET", "POST"],
//         credentials: true,
//     },
// }

function setUpSocket(httpServer) {
    const io = new Server(httpServer);

    const peers = new Map();

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        // console.log("user is");
        // console.log(socket.user); //username,userId -> userId:{socket,name,roomName}

        socket.on("join-room", ({ roomId }) => {
            if (!roomId) return;
            const { userId, name } = socket.user;

            // peers.push({ socketId: socket.id, name, userId });

            peers.set(userId, { socketId: socket.id, name, userId });

            console.log(
                "peers after setting",
                JSON.stringify(Array.from(peers.entries()))
            );

            socket.join(roomId);
            socket.to(roomId).emit("new-user", {
                userId,
                name,
                socketId: socket.id,
            });

            socket.emit("peers", JSON.stringify(Array.from(peers.entries())));
        });

        socket.on("offer", ({ offer, userId, roomId }) => {
            if (!roomId) return;

            // const { userId, roomId } = data;
            // console.log("got offer from ", userId, "with room ID ", roomId);
            socket.to(roomId).emit("offer", { offer, userId });
        });

        socket.on("answer", ({ userId, roomId, answer }) => {
            console.log("got answer and answer is ");
            console.log(answer);
            if (!roomId) return;
            socket.to(roomId).emit("answer", { userId, answer });
        });

        socket.on("ice-candidate", ({ iceCandidate, userId, roomId }) => {
            console.log("received ice candidate");
            console.log(iceCandidate);
            socket.to(roomId).emit("ice-candidate", { iceCandidate, userId });
        });
    });
}

export const socket = {
    setUpSocket,
};
