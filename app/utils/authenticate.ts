type UserDetailsArgs = {
    email: string;
    password: string;
    name: string;
};

export const authenticate = (userData: UserDetailsArgs) => {
    const data = fetch("");
};

type CreateUser = (userDetails: UserDetailsArgs) => Promise<Error | null>;

export const createUser: CreateUser = async (userDetails) => {
    const reponse = await fetch("http://localhost:3000/user", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
    });

    if (!reponse.ok) {
        return new Error("invalid reponse");
    }

    const message = await reponse.json();

    if (!message.length) {
        return new Error("invalid reponse");
    }

    return null;
};
