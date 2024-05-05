import express from "express";

import userCtrl from "../../controllers/user/self";

const router = express.Router();

router.get("/", userCtrl.getProfile);
router.put("/", userCtrl.updateProfile);
router.delete("/", userCtrl.deleteProfile);

export default router;
