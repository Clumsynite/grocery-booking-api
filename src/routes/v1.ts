import express from "express";

import adminAuth from "../middleware/adminAuth";

import adminRoutes from "./admin";
import categoryRoutes from "./category";
import productRoutes from "./product";
import userRoutes from "./user";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/product", [adminAuth], productRoutes);
router.use("/category", [adminAuth], categoryRoutes);
router.use("/user", userRoutes);

export default router;
