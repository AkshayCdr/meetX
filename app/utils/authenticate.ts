import { useDebugValue } from "react";

// const url = "http://192.168.0.129:3000";
const url = "http://localhost:3000";

type UserDetailsArgs = {
    email: string;
    password: string;
    name?: string;
};

type Authenticate = (
    userData: UserDetailsArgs
) => Promise<[null | Response, null | Error]>;

export const authenticate: Authenticate = async (userData) => {
    const res = await fetch(url + "/user/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    if (!res.ok) return [null, new Error("error authenticating")];

    return [res, null];
};

type CreateUser = (userDetails: UserDetailsArgs) => Promise<Error | null>;

export const createUser: CreateUser = async (userDetails) => {
    const reponse = await fetch(url + "/user", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
    });

    if (!reponse.ok) return new Error("invalid reponse");

    const message = await reponse.json();

    return null;
};
