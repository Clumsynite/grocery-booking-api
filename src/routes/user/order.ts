import express from "express";

import ctrl from "../../controllers/user/order";

const router = express.Router();

router.post("/", ctrl.createOrder);
router.get("/:order_id", ctrl.getOrderById);
router.get("/", ctrl.getOrders);

export default router;
