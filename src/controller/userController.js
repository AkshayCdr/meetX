import { User } from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const createUser = async (req, res) => {
    const data = req.body;
    await User.add(data);
    res.status(201).send("hai");
};

export const getUser = async (req, res) => {
    const data = await User.getAll();
    res.status(200).send(JSON.stringify(data));
};

export const login = async (req, res) => {
    const { name, password } = req.body;

    const uuid = await User.getUuid(name);

    if (!uuid) return res.status(401).status("username dont exist");

    //check  username

    //check password
    const pass = await User.getPassword(uuid);

    console.log(pass);

    if (pass !== password) return res.status(401).send("password dont exist");

    const token = jwt.sign({ userId: uuid, name }, config.jwtKey, {
        expiresIn: "1h",
    });

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    };

    res.cookie("token", token, options);

    res.status(200).send("login succces");
};
