import { Response } from "express";

import logger from "../../utils/logger";
import { AdminRequest } from "../../@types/Express";

import { Category } from "../../@types/database";
import { count } from "../../@types/Knex";

import * as categoryService from "../../db_services/category";
import validators from "../../validators";

const createCategory = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, body } = req;
  try {
    const { name, description } = body;
    const bodyValidation = validators.category.newCategory.validate({ name, description });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const categoryExists = await categoryService.getCategoryByFilter({ name });
    if (categoryExists) {
      return res.status(400).json({
        status: false,
        message: "Category already exists",
        data: null,
      });
    }

    const category = await categoryService.createCategory({
      name,
      description,
      created_by: admin_id,
      updated_by: admin_id,
    });

    return res.status(200).json({ status: true, message: "Category Created Successfully", data: { category } });
  } catch (err) {
    const message = "Error while creating category";
    logger.error(message, { err, admin_id, requestId, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const updateCategory = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, body, params } = req;
  const { category_id } = params;

  try {
    const { name, description } = body;
    const bodyValidation = validators.category.oldCategory.validate({ name, description, category_id });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const categoryData = await categoryService.getCategoryById(category_id);
    if (!categoryData) {
      return res.status(400).json({
        status: false,
        message: "Category not found",
        data: null,
      });
    }

    const categoryExists = await categoryService.getCategoryByFilter({ name });
    if (categoryExists && categoryExists.category_id !== category_id) {
      return res.status(400).json({
        status: false,
        message: "Category name already exists",
        data: null,
      });
    }

    const updateObj = { name, description, updated_by: admin_id };
    const category = await categoryService.updateCategory({ category_id }, updateObj);

    return res.status(200).json({ status: true, message: "Category Updated Successfully", data: { category } });
  } catch (err) {
    const message = "Error while updated category";
    logger.error(message, { err, admin_id, requestId, body, category_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getCategory = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, params } = req;
  const { category_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(category_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "Category ID is invalid",
        data: null,
      });
    }

    const categoryData = await categoryService.getCategoryById(category_id);
    if (!categoryData) {
      return res.status(400).json({
        status: false,
        message: "Category not found",
        data: null,
      });
    }
    return res.status(200).json({ status: true, message: "Category Found", data: categoryData });
  } catch (err) {
    const message = "Error while Fetching Category";
    logger.error(message, { err, admin_id, requestId, category_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getCategories = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, query } = req;
  try {
    const { limit: qLimit, skip: qSkip } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;

    const categories = (await categoryService.getAllCategories({ limit, skip })) as Partial<Category>[];
    let count = 0;

    if (categories?.length) {
      const allCategoriesCount = (await categoryService.getAllCategories({
        limit: null,
        skip: null,
        totalRecords: true,
      })) as count;
      count = Number(allCategoriesCount?.count);
    }

    return res
      .header("Access-Control-Expose-Headers", "x-total-count")
      .setHeader("x-total-count", count)
      .status(200)
      .json({
        status: true,
        message: "Categories Fetched Successfully",
        data: categories,
      });
  } catch (err) {
    const message = "Error while fetching all categories";
    logger.error(message, { err, admin_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const deleteCategory = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, params, body } = req;
  const { category_id } = params;

  try {
    const validator = validators.common.uuid.required().validate(category_id);
    if (validator.error) {
      return res.status(400).json({
        status: false,
        message: "Category ID is invalid",
        data: null,
      });
    }

    const categoryData = await categoryService.getCategoryByFilter({ category_id });
    if (!categoryData) {
      return res.status(400).json({
        status: false,
        message: "Category not found",
        data: null,
      });
    }

    // TODO: check if a product exists in category. Can delete only if no product exists

    await categoryService.hardDeleteCategory({ category_id });

    return res.status(200).json({ status: true, message: `Category Deleed successfully`, data: null });
  } catch (err) {
    const message = "Error while deleting category";
    logger.error(message, { err, admin_id, requestId, params, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getCategoriesForDropdown = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId } = req;
  try {
    const categories = await categoryService.getCategoriesForDropdown();

    return res.status(200).json({
      status: true,
      message: "Category List for Dropdown Fetched Successfully",
      data: categories,
    });
  } catch (err) {
    const message = "Error while fetching all categories";
    logger.error(message, { err, admin_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  createCategory,
  updateCategory,
  getCategory,
  getCategories,
  deleteCategory,
  getCategoriesForDropdown,
};
