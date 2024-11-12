const generateUniqueId = () => Math.floor(10000000 + Math.random() * 90000000);

import { createClient } from "redis";
import { config } from "../config.js";

const client = createClient({ url: config.redis_url });

client.on("error", (err) => console.log("redis client eroor", err));

await client.connect();

const add = async (userDetails) => {
    const id = generateUniqueId();

    console.log(userDetails.email);

    await client.set(`username:${userDetails.email}`, id);

    await client.hSet(`user:${id}`, userDetails);
};

const getAll = async () => {
    const userNames = await client.keys("user:*");

    const user = Promise.all(
        userNames.map(async (user) => await client.hGetAll(user))
    );

    return user;
};

const get = async (email) => {
    return client.hGetAll(`user:${email}`);
};

const getUuid = async (email) => {
    const id = await client.get(`username:${email}`);

    return id;
};

const getPassword = async (userId) => {
    const password = await client.hGet(`user:${userId}`, "password");

    return password;
};

const getName = async (userId) => {
    const name = await client.hGet(`user:${userId}`, "name");

    return name;
};

export const User = {
    getName,
    add,
    getAll,
    getUuid,
    getPassword,
};
