import { User } from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const createUser = async (req, res) => {
    const data = req.body;
    console.log(data);

    await User.add(data);
    res.status(201).send({ message: "hai" });
};

export const getUser = async (req, res) => {
    const data = await User.getAll();
    res.status(200).send(JSON.stringify(data));
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const uuid = await User.getUuid(email);

    if (!uuid) return res.status(401).status({ message: "invalid email" });

    //check  username

    //check password
    const pass = await User.getPassword(uuid);

    console.log(pass);

    if (pass !== password)
        return res.status(401).send({ message: "password dont exist" });

    const name = await User.getName(uuid);

    console.log(name);

    const token = jwt.sign({ userId: uuid, name }, config.jwtKey, {
        expiresIn: "1h",
    });

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    };

    res.cookie("token", token, options);

    res.status(200).send({ message: "login succces" });
};
