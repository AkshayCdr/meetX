import { useDebugValue } from "react";

type UserDetailsArgs = {
    email: string;
    password: string;
    name?: string;
};

export const authenticate = async (userData: UserDetailsArgs) => {
    const reponse = await fetch("http://localhost:3000/user/login", {
        method: "post",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    if (!reponse.ok) return new Error("error authenticating");

    const data = await reponse.json();

    console.log(data);

    return null;
};

type CreateUser = (userDetails: UserDetailsArgs) => Promise<Error | null>;

export const createUser: CreateUser = async (userDetails) => {
    const reponse = await fetch("http://localhost:3000/user", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
    });

    if (!reponse.ok) return new Error("invalid reponse");

    const message = await reponse.json();

    console.log(message);
    // if (!message.length) {
    //     return new Error("invalid reponse");
    // }

    return null;
};
