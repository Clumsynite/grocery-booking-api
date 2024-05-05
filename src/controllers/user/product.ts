import { Response } from "express";

import logger from "../../utils/logger";

import { Product } from "../../@types/database";
import { count } from "../../@types/Knex";

import * as productService from "../../db_services/product";
import * as categoryService from "../../db_services/category";
import { UserRequest } from "../../@types/Express";
import validators from "../../validators";

const getProductsForUsers = async (req: UserRequest, res: Response) => {
  const { requestId, query, user_id } = req;
  try {
    const { limit: qLimit, skip: qSkip, category_id: qCategoryId } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;
    const category_id = String(qCategoryId || "");

    if (category_id) {
      const categoryExists = await categoryService.getCategoryById(category_id);
      if (!categoryExists) {
        return res.status(400).json({
          status: false,
          message: "Category not found",
          data: null,
        });
      }
    }

    const products = (await productService.getProductsForUsers({ limit, skip, category_id })) as Partial<Product>[];
    let count = 0;

    if (products?.length) {
      const allProductsCount = (await productService.getProductsForUsers({
        limit: null,
        skip: null,
        totalRecords: true,
        category_id,
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
        data: products,
      });
  } catch (err) {
    const message = "Error while fetching products for users";
    logger.error(message, { err, user_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getProductById = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params } = req;
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
    logger.error(message, { err, user_id, requestId, product_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  getProductsForUsers,
  getProductById
};
