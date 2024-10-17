const generateUniqueId = () => Math.floor(10000000 + Math.random() * 90000000);

import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.log("redis client eroor", err));

await client.connect();

const add = async (userDetails) => {
    const id = generateUniqueId();

    console.log(userDetails);

    await client.hSet(`user:${id}`, userDetails);
};

const getAll = async () => {
    const userNames = await client.keys("user:*");

    const usersPromise = userNames.map(
        async (user) => await client.hGetAll(user)
    );

    const user = await Promise.all(usersPromise);

    return user;
};

export const User = {
    add,
    getAll,
};
