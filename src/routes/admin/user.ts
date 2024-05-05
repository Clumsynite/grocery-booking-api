import express from "express";

import adminCtrl from "../../controllers/admin/user";

const router = express.Router();

router.get("/:admin_id", adminCtrl.getAdminById);
router.get("/", adminCtrl.getAdminUsers);

router.put("/:admin_id", adminCtrl.updateAdmin);
router.post("/", adminCtrl.createAdmin);
router.delete("/:admin_id", adminCtrl.deleteAdmin);

export default router;
