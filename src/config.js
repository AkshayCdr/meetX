import dotenv from "dotenv";

dotenv.config();

export const config = {
    jwtKey: process.env.JWT_KEY,
};
