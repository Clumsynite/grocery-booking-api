import { Response } from "express";

import logger from "../../utils/logger";
import { AdminRequest } from "../../@types/Express";

import { Product } from "../../@types/database";
import { count } from "../../@types/Knex";

import * as productService from "../../db_services/product";
import * as categoryService from "../../db_services/category";
import validators from "../../validators";

const createProduct = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, body } = req;
  try {
    const { name, description, category_id, price, available_stock } = body;
    const bodyValidation = validators.product.newProduct.validate({
      name,
      description,
      category_id,
      price,
      available_stock,
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const productExists = await productService.getProductByFilter({ name });
    if (productExists) {
      return res.status(400).json({
        status: false,
        message: "Product already exists",
        data: null,
      });
    }

    const categoryExists = await categoryService.getCategoryById(category_id);
    if (!categoryExists) {
      return res.status(400).json({
        status: false,
        message: "Category not found",
        data: null,
      });
    }

    const product = await productService.createProduct({
      name,
      description,
      price,
      available_stock,
      category_id,
      is_deleted: false,
      created_by: admin_id,
      updated_by: admin_id,
    });

    return res.status(200).json({ status: true, message: "Product Created Successfully", data: { product } });
  } catch (err) {
    const message = "Error while creating product";
    logger.error(message, { err, admin_id, requestId, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const updateProduct = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, body, params } = req;
  const { product_id } = params;

  try {
    const { name, description, category_id, price, available_stock } = body;
    const bodyValidation = validators.product.oldProduct.validate({
      name,
      description,
      product_id,
      category_id,
      price,
      available_stock,
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const productData = await productService.getProductById(product_id);
    if (!productData) {
      return res.status(400).json({
        status: false,
        message: "Product not found",
        data: null,
      });
    }

    const productExists = await productService.getProductByFilter({ name });
    if (productExists && productExists.product_id !== product_id) {
      return res.status(400).json({
        status: false,
        message: "Product name already exists",
        data: null,
      });
    }

    const categoryExists = await categoryService.getCategoryById(category_id);
    if (!categoryExists) {
      return res.status(400).json({
        status: false,
        message: "Category not found",
        data: null,
      });
    }

    const updateObj = { name, description, category_id, price, available_stock, updated_by: admin_id };
    const product = await productService.updateProduct({ product_id }, updateObj);

    return res.status(200).json({ status: true, message: "Product Updated Successfully", data: { product } });
  } catch (err) {
    const message = "Error while updated product";
    logger.error(message, { err, admin_id, requestId, body, product_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getProduct = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, params } = req;
  const { product_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(product_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "Product ID is invalid",
        data: null,
      });
    }

    const productData = await productService.getProductById(product_id);
    if (!productData) {
      return res.status(400).json({
        status: false,
        message: "Product not found",
        data: null,
      });
    }
    return res.status(200).json({ status: true, message: "Product Found", data: productData });
  } catch (err) {
    const message = "Error while Fetching Product";
    logger.error(message, { err, admin_id, requestId, product_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getProducts = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, query } = req;
  try {
    const { limit: qLimit, skip: qSkip, category_id: qCategoryId } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;
    const category_id = String(qCategoryId || "");

    const categoryExists = await categoryService.getCategoryById(category_id);
    if (!categoryExists) {
      return res.status(400).json({
        status: false,
        message: "Category not found",
        data: null,
      });
    }

    const categories = (await productService.getAllProducts({ limit, skip, category_id })) as Partial<Product>[];
    let count = 0;

    if (categories?.length) {
      const allProductsCount = (await productService.getAllProducts({
        limit: null,
        skip: null,
        totalRecords: true,
      })) as count;
      count = Number(allProductsCount?.count);
    }

    return res
      .header("Access-Control-Expose-Headers", "x-total-count")
      .setHeader("x-total-count", count)
      .status(200)
      .json({
        status: true,
        message: "Products Fetched Successfully",
        data: categories,
      });
  } catch (err) {
    const message = "Error while fetching all categories";
    logger.error(message, { err, admin_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const deleteProduct = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, params, body } = req;
  const { product_id } = params;

  try {
    const validator = validators.common.uuid.required().validate(product_id);
    if (validator.error) {
      return res.status(400).json({
        status: false,
        message: "Product ID is invalid",
        data: null,
      });
    }

    const productData = await productService.getProductByFilter({ product_id });
    if (!productData) {
      return res.status(400).json({
        status: false,
        message: "Product not found",
        data: null,
      });
    }

    // TODO: remove from cart

    await productService.softDeleteProduct({ product_id });

    return res.status(200).json({ status: true, message: `Product Deleed successfully`, data: null });
  } catch (err) {
    const message = "Error while deleting product";
    logger.error(message, { err, admin_id, requestId, params, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  createProduct,
  updateProduct,
  getProduct,
  getProducts,
  deleteProduct,
};
