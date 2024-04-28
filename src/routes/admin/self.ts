import express from "express";

import adminCtrl from "../../controllers/admin/self";

const router = express.Router();

router.get("/profile", adminCtrl.getProfile);

export default router;
