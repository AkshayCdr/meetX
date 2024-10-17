const generateUniqueId = () => Math.floor(10000000 + Math.random() * 90000000);

import { cli } from "@remix-run/dev";
import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.log("redis client eroor", err));

await client.connect();

const add = async (userDetails) => {
    const id = generateUniqueId();

    console.log(userDetails.name);

    await client.set(`username:${userDetails.name}`, id);

    await client.hSet(`user:${id}`, userDetails);
};

const getAll = async () => {
    const userNames = await client.keys("user:*");

    const user = Promise.all(
        userNames.map(async (user) => await client.hGetAll(user))
    );

    return user;
};

const get = async (userId) => {
    return client.hGetAll(`user:${userId}`);
};

const getUuid = async (username) => {
    const id = await client.get(`username:${username}`);

    return id;
};

const getPassword = async (userId) => {
    const password = await client.hGet(`user:${userId}`, "password");

    console.log(password);

    return password;
};

export const User = {
    add,
    getAll,
    getUuid,
    getPassword,
};
