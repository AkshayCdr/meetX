import { Router } from "express";
import { createUser } from "../controller/userController";

const router = Router();

router.get("/");
router.post("/", createUser);

export default router;
