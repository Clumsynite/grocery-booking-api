import express from "express";

import ctrl from "../../controllers/user/order";

const router = express.Router();

router.post("/", ctrl.createOrder);

export default router;
