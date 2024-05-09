import express from "express";

import auth from "../../middleware/userAuth";

import authRouter from "./auth";
import selfRouter from "./self";
import addressRouter from "./address";
import productRouter from "./product";
import cartRouter from "./cart";
import orderRouter from "./order";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/self", [auth], selfRouter);
router.use("/address", [auth], addressRouter);
router.use("/product", [auth], productRouter);
router.use("/cart", [auth], cartRouter);
router.use("/order", [auth], orderRouter);

export default router;
