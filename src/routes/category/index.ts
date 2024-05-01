import express from "express";

import ctrl from "../../controllers/category";

const router = express.Router();

router.get("/:category_id", ctrl.getCategory);
router.put("/:category_id", ctrl.updateCategory);
router.delete("/:category_id", ctrl.deleteCategory);
router.get("/", ctrl.getCategories); // all categories
router.post("/", ctrl.createCategory);

export default router;
