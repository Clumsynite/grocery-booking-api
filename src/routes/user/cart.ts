import express from "express";

import ctrl from "../../controllers/user/cart";

const router = express.Router();

router.post("/", ctrl.upsertCart);
router.put("/", ctrl.upsertCart);
router.delete("/:cart_item_id", ctrl.deleteFromCart);
router.get("/:cart_from_id", ctrl.getCartItem);
router.get("/", ctrl.getCartItems);

export default router;
