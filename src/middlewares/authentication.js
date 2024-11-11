import jwt from "jsonwebtoken";
import { config } from "../config.js";
import cookie from "cookie";

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
    const cookies = socket.handshake.headers.cookie;

    console.log("cookies are", JSON.stringify(cookie));
    const data = cookie.parse(cookies);

    console.log("after parsing", JSON.stringify(data));

    if (!data) return next(new Error("token doesn't exist"));

    const { token } = data;

    console.log(token);

    jwt.verify(token, config.jwtKey, (err, usr) => {
        if (err) return next(new Error("invalid token"));
        socket.user = usr;
    });

    return next();
};
