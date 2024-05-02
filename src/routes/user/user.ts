import express from "express";

import userCtrl from "../../controllers/user/user";
import selfCtrl from "../../controllers/user/self";

const router = express.Router();

router.post("/", userCtrl.register);
router.get("/", selfCtrl.getProfile);
router.put("/", userCtrl.updateUser);
router.delete("/", userCtrl.deleteUser);

export default router;
