import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";
import { socket } from "./src/socket.js";
import userRouter from "./src/routes/user.route.js";

// notice that the result of `remix vite:build` is "just a module"
import * as build from "./build/server/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const corsOptions = {
    origin: "http://localhost:5173",
};
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// app.use(express.static("build/client"));

app.use("/user", userRouter);

// and your app is "just a request handler"
// app.all("*", createRequestHandler({ build }));

const httpServer = createServer(app);

socket.setUpSocket(httpServer);

httpServer.listen(3000, () => console.log("listening in 3000...."));
