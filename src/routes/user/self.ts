import express from "express";

import userCtrl from "../../controllers/user/self";

const router = express.Router();

router.get("/profile", userCtrl.getProfile);

export default router;
