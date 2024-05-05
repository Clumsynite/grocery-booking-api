import express from "express";

import auth from "../../middleware/userAuth";

import authRouter from "./auth";
import selfRouter from "./self";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/self", [auth], selfRouter);

export default router;
