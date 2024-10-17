import { User } from "../model/userModel.js";

export const createUser = async (req, res) => {
    const data = req.body;
    await User.add(data);
    res.status(201).send("hai");
};

export const getUser = async (req, res) => {
    const data = await User.getAll();
    res.status(200).send(JSON.stringify(data));
};
