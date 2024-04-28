import express from "express";

import auth from "../../middleware/adminAuth";

import authRouter from "./auth";
import selfRouter from "./self";
import userRouter from "./user";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/self", [auth], selfRouter);
router.use("/user", [auth], userRouter);

export default router;
