import { Server } from "socket.io";
import { authenticateSocket } from "./middlewares/authentication.js";

function setUpSocket(httpServer) {
    const io = new Server(httpServer, {});

    const peers = [];

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        console.log(socket.user); //username,userId -> userId:{socket,name,roomName}

        socket.on("join-room", (data) => {
            const { roomId } = data;
            const { userId, name } = socket.user;

            peers.push({ userId: { socket, name, roomId } });

            socket.join(roomId);
            socket.emit("new-user", peers);
        });

        socket.on("offer", (offer, data) => {
            const { roomId } = data;
            socket.to(roomId).emit("offer", offer);
        });

        socket.on("answer", (answer, data) => {
            const { roomId } = data;
            socket.to(roomId).emit("answer", answer);
        });

        socket.on("ice-candidate", (ice, data) => {
            const { roomId } = data;
            socket.to(roomId).emit("ice-candidate", ice);
        });
    });
}

export const socket = {
    setUpSocket,
};
