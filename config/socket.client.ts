import { io } from "socket.io-client";

export const socket = io("https://meetx-dwcw.onrender.com", {
    // autoConnect: false,
    withCredentials: true,
});
