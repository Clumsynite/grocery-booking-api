import { Response } from "express";

import { v4 } from "uuid";
import knex from "../../knex";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";

import * as cartItemService from "../../db_services/cart_item";
import * as productService from "../../db_services/product";
import * as orderService from "../../db_services/order";
import * as orderItemsService from "../../db_services/orderItems";
import * as addressService from "../../db_services/address";

import validators from "../../validators";
import { Status } from "src/@types/Common";
import { Order } from "src/@types/database";
import { count } from "src/@types/Knex";

const createOrder = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, body } = req;
  const trx = await knex.transaction();
  try {
    const { payment_mode, user_instructions, address_id } = body;
    const bodyValidation = validators.order.newOrder.validate({
      payment_mode,
      user_instructions,
      address_id,
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

    const address = await addressService.getAddressById(address_id);
    if (!address) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: "Address not found.",
        data: null,
      });
    }

    const cartItems = await cartItemService.getCartIemsByFilter({ user_id }, { trx });

    if (cartItems.length === 0) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: "Cart is Empty. Add items to cart before placing order.",
        data: null,
      });
    }

    const order_id = v4();

    const orderItems = [];
    let item, product;
    for (let i = 0; i < cartItems.length; i++) {
      item = cartItems[i];
      const { product_id, qty } = item;

      product = await productService.getProductByFilter({ product_id: item.product_id }, { trx });
      if (!product || product.is_deleted || item.qty > product.available_stock) {
        const message = `${product?.name || "Product"} is not available. Check your cart and order again`;
        logger.debug(message, { requestId, item, product });
        await trx.rollback();
        return res.status(400).json({
          status: false,
          message,
          data: null,
        });
      }
      const { available_stock, price } = product;

      const orderItem = {
        order_item_id: v4(),
        order_id,
        user_id,
        product_id,
        price,
        qty,
        order_status: Status.PENDING,
      };

      orderItems.push(orderItem);

      await productService.updateProduct(
        { product_id },
        {
          available_stock: available_stock - qty,
        },
        { trx }
      );
    }

    const total_amount = orderItems.reduce((acc, oi) => acc + Number(oi.price), 0);
    const item_count = orderItems.reduce((acc, oi) => acc + Number(oi.qty), 0);

    const { customer_name, phone_number, address_nickname, address_line, city, state, pincode, instructions } = address;

    const newOrder = await orderService.createOrder(
      {
        order_id,
        user_id,
        total_amount,
        payment_mode,
        order_status: Status.PENDING,
        item_count,
        user_instructions,
        admin_remarks: "",
        ordered_at: new Date().toISOString(),
        shipped_at: null,
        out_for_delivery_at: null,
        delivery_at: null,
        returned_at: null,
        address_id,
        customer_name,
        phone_number,
        address_nickname,
        address_line,
        city,
        state,
        pincode,
        instructions,
      },
      order_id,
      { trx }
    );
    await orderItemsService.bulkCreateOrderItems(orderItems, { trx });

    await cartItemService.hardDeleteCartItem({ user_id }, { trx });

    await trx.commit();

    return res.status(200).json({ status: true, message: "Order Created successfully", data: newOrder });
  } catch (err) {
    await trx.rollback();
    const message = "Error while creating order";
    logger.error(message, { err, user_id, requestId, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getOrders = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, query } = req;
  try {
    const { limit: qLimit, skip: qSkip } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;

    const orders = (await orderService.getAllOrders({ limit, skip, user_id })) as Partial<Order>[];
    let count = 0;
    if (orders.length) {
      const allOrdersCount = (await orderService.getAllOrders({
        limit: null,
        skip: null,
        totalRecords: true,
        user_id,
      })) as count;
      count = Number(allOrdersCount?.count);
    }

    return res
      .header("Access-Control-Expose-Headers", "x-total-count")
      .setHeader("x-total-count", count)
      .status(200)
      .json({
        status: true,
        message: "Orders Fetched Successfully",
        data: orders,
      });
  } catch (err) {
    const message = "Error while getting orders";
    logger.error(message, { err, user_id, requestId, query });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getOrderById = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params } = req;
  const { order_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(order_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "Address ID is invalid",
        data: null,
      });
    }

    const order = await orderService.getOrderById(order_id);
    if (!order) {
      return res.status(400).json({
        status: false,
        message: "Order not found",
        data: null,
      });
    }

    const items = await orderItemsService.getAllOrderItems({ order_id });

    return res.status(200).json({ status: false, message: "Order fetched successfully", data: { order, items } });
  } catch (err) {
    const message = "Error while getting order by id";
    logger.error(message, { err, user_id, requestId, params });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default { createOrder, getOrders, getOrderById };
