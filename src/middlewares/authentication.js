import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const authentication = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).send("no token");

    jwt.verify(token, config.jwtKey, (err, usr) => {
        if (err) return res.status(401).send("invalid token");
        req.user = usr;
        next();
    });
};

export const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    next();
};
