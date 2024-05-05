import { Response } from "express";

import { v4 } from "uuid";
import knex from "../../knex";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";

import * as cartItemService from "../../db_services/cart_item";
import * as productService from "../../db_services/product";

import validators from "../../validators";
import { CartItemsForUser } from "src/@types/database/CartItem";

const upsertCart = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, body } = req;
  const trx = await knex.transaction();
  try {
    const { product_id, qty } = body;
    const bodyValidation = validators.cartItem.newCartItem.validate({
      product_id,
      qty,
      user_id,
    });
    if (bodyValidation.error) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const productExists = await productService.getProductById(product_id, { trx });

    const cartItemExists = await cartItemService.getCartItemByFilter({ user_id, product_id }, { trx });

    if (!productExists) {
      if (!cartItemExists) {
        await trx.rollback();
        return res.status(400).json({
          status: false,
          message: "Product not found",
          data: null,
        });
      } else {
        const { cart_item_id } = cartItemExists;
        await cartItemService.hardDeleteCartItem({ cart_item_id }, { trx });
        await trx.commit();
        return res.status(200).json({
          status: false,
          message: "Product not available. Removed from cart.",
          data: null,
        });
      }
    }

    if (productExists.available_stock < qty) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: `Available Stock is only ${productExists.available_stock}`,
        data: null,
      });
    }

    if (cartItemExists) {
      const { cart_item_id } = cartItemExists;
      if (qty <= 0) {
        const del = await cartItemService.hardDeleteCartItem({ cart_item_id }, { trx });
        await trx.commit();
        return res.status(200).json({
          status: false,
          message: "Product removed from cart.",
          data: del,
        });
      } else {
        const upd = await cartItemService.updateCartItem({ cart_item_id }, { qty }, { trx });
        await trx.commit();
        return res.status(200).json({
          status: false,
          message: "Product quantity updated in cart.",
          data: upd,
        });
      }
    }

    if (qty <= 0) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: `Quantity must be atleast 1`,
        data: null,
      });
    }

    const cartItem = await cartItemService.createCartItem(
      {
        product_id,
        qty,
        user_id,
      },
      v4(),
      { trx }
    );
    await trx.commit();
    return res.status(200).json({ status: true, message: "Product added to cart", data: cartItem });
  } catch (err) {
    await trx.rollback();
    const message = "Error while creating cartItem";
    logger.error(message, { err, user_id, requestId, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getCartItem = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params } = req;
  const { cart_item_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(cart_item_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "Cart Item ID is invalid",
        data: null,
      });
    }

    const cartItemData = await cartItemService.getCartItemById(cart_item_id);
    if (!cartItemData) {
      return res.status(400).json({
        status: false,
        message: "Cart Item not found",
        data: null,
      });
    }
    return res.status(200).json({ status: true, message: "Cart Item Found", data: cartItemData });
  } catch (err) {
    const message = "Error while Fetching Cart Item";
    logger.error(message, { err, user_id, requestId, cart_item_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getCartItems = async (req: UserRequest, res: Response) => {
  const { user_id, requestId } = req;
  try {
    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });
    }

    const cartItems = (await cartItemService.getCartItemsForUser({ user_id })) as Partial<CartItemsForUser>[];

    const total = cartItems.reduce((acc, ci) => acc + Number(ci.price), 0).toFixed(2);

    return res.status(200).json({
      status: true,
      message: "CartItems Fetched Successfully",
      data: { total, cart: cartItems },
    });
  } catch (err) {
    const message = "Error while fetching all cart itemes";
    logger.error(message, { err, user_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const deleteFromCart = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params, body } = req;
  const trx = await knex.transaction();
  try {
    const { cart_item_id } = params;

    if (!user_id) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });
    }

    const cartItemData = await cartItemService.getCartItemByFilter({ cart_item_id });
    if (!cartItemData) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: "Cart Item not found",
        data: null,
      });
    }

    await cartItemService.hardDeleteCartItem({ cart_item_id }, { trx });
    await trx.commit();
    return res.status(200).json({
      status: false,
      message: "Product removed from cart.",
      data: null,
    });
  } catch (err) {
    await trx.rollback();
    const message = "Error while deleting cartItem";
    logger.error(message, { err, user_id, requestId, params, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  upsertCart,
  getCartItem,
  getCartItems,
  deleteFromCart,
};
