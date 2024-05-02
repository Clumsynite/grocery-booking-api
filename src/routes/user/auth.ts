import express from "express";

import userCtrl from "../../controllers/user/auth";
import auth from "../../middleware/userAuth";

const router = express.Router();

router.post("/signin", userCtrl.signin);

router.post("/signout", [auth], userCtrl.signout);

router.put("/update-password", [auth], userCtrl.updatePassword);

export default router;
