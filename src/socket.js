import { Server } from "socket.io";
import { authenticateSocket } from "./middlewares/authentication.js";

function setUpSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    const peers = new Map();

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        // console.log("user is");
        // console.log(socket.user); //username,userId -> userId:{socket,name,roomName}

        socket.on("join-room", (data) => {
            const { roomId } = data;
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

        socket.on("offer", (offer, data) => {
            const { userId } = data;
            socket.to(roomId).emit("offer", offer);
        });

        socket.on("answer", (answer, data) => {
            const { roomId } = data;
            socket.to(roomId).emit("answer", answer);
        });

        socket.on("ice-candidate", (ice, data) => {
            console.log("received ice candidate");
            console.log(data);
            const { socketId, userId } = data;
            socket.to(socketId).emit("ice-candidate", ice, userId);
        });
    });
}

export const socket = {
    setUpSocket,
};
