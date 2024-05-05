import express from "express";

import ctrl from "../../controllers/user/address";

const router = express.Router();

router.get("/:address_id", ctrl.getAddress);
router.put("/:address_id", ctrl.updateAddress);
router.delete("/:address_id", ctrl.deleteAddress);
router.get("/", ctrl.getAddresses);
router.post("/", ctrl.createAddress);

export default router;
