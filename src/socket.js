import { Server } from "socket.io";

function setUpSocket(httpServer) {
    const io = new Server(httpServer, {});

    io.on("connection", (socket) => {
        socket.on("join-room", (data) => {
            const { roomId } = data;
            socket.join(roomId);
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
