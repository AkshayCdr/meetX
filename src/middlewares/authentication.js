import jwt from "jsonwebtoken";
import { config } from "../config.js";

const authentication = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).send("no token");

    jwt.verify(token, config.jwtKey, (err, usr) => {
        if (err) return res.status(401).send("invalid token");
        req.user = usr;
        next();
    });
};
