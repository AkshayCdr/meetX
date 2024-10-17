import { Router } from "express";
import { createUser, getUser } from "../controller/userController.js";

const router = Router();

router.get("/", getUser);
router.post("/", createUser);

export default router;
