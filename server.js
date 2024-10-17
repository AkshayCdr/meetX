import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";
import { socket } from "./src/socket.js";
import userRouter from "./src/routes/user.route.js";

// notice that the result of `remix vite:build` is "just a module"
import * as build from "./build/server/index.js";

const app = express();
app.use(express.json());
app.use(express.static("build/client"));

app.use("/user", userRouter);

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

const httpServer = createServer(app);

socket.setUpSocket(httpServer);

httpServer.listen(3000, () => console.log("listening in 3000...."));
