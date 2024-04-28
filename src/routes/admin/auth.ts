import express from "express";

import adminCtrl from "../../controllers/admin/auth";
import auth from "../../middleware/adminAuth";

const router = express.Router();

router.post("/signin", adminCtrl.signin);

router.post("/signout", [auth], adminCtrl.signout);

router.put("/update-password", [auth], adminCtrl.updatePassword);

export default router;
