import express from "express";

import ctrl from "../../controllers/user/product";

const router = express.Router();

router.get("/:product_id", ctrl.getProductById);
router.get("/", ctrl.getProductsForUsers);

export default router;
