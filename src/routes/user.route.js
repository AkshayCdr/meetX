import { Router } from "express";
import { createUser, getUser, login } from "../controller/userController.js";

const router = Router();

router.get("/", getUser);
router.post("/", createUser);
router.post("/login", login);

export default router;
