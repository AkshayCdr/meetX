import dotenv from "dotenv";

dotenv.config();

export const config = {
    jwtKey: process.env.JWT_KEY,
    redis_url: process.env.REDIS_URL,
};
