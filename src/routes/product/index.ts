import express from "express";

import ctrl from "../../controllers/product";

const router = express.Router();

router.get("/:product_id", ctrl.getProduct);
router.put("/:product_id", ctrl.updateProduct);
router.delete("/:product_id", ctrl.deleteProduct);
router.get("/", ctrl.getProducts); // all Products
router.post("/", ctrl.createProduct);

export default router;
