import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { OrderItems, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.ORDER_ITEMS;

export const createOrderItems = async (
  object: Partial<OrderItems>,
  order_item_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<OrderItems | null> => {
  object.order_item_id = order_item_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as OrderItems;
};

export const bulkCreateOrderItems = async (object: Partial<OrderItems>[], { trx }: trx = {}) => {
  return await (trx || knex)(tablename).returning("*").insert(object);
};

export const getOrderItemsById = async (order_item_id: string, { trx }: trx = {}): Promise<OrderItems | null> => {
  if (!order_item_id) throw new Error("Order Item ID is required");
  const query = (trx || knex)(tablename).where({ order_item_id }).select("*").first();
  return query;
};

export const getAllOrderItems = async (
  { order_id }: { order_id: string },
  { trx }: trx = {}
): Promise<Partial<OrderItems>[]> => {
  const columns = [
    "oi.order_item_id",
    "p.name",
    knex.raw("oi.qty::numeric * oi.price::numeric as price"),
    "oi.qty",
    "oi.price as per_price",
    "oi.order_status",
  ];
  const query = (trx || knex)(`${tablename} as oi`)
    .select(columns)
    .where({ order_id })
    // .join(`${TABLE_NAME.ORDER} as o`, "o.order_id", "oi.order_id")
    .join(`${TABLE_NAME.PRODUCT} as p`, "p.product_id", "oi.product_id")
    .orderBy("p.name", "asc");

  return query;
};

export const getOrderItemByFilter = async (
  filter: Partial<OrderItems>,
  { trx }: trx = {}
): Promise<OrderItems | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const getOrderItemsByFilter = async (filter: Partial<OrderItems>, { trx }: trx = {}): Promise<OrderItems[]> => {
  const query = (trx || knex)(tablename).select("*").where(filter);
  // console.log(query.toString());
  return query;
};

export const updateOrderItems = async (
  filter: Partial<OrderItems>,
  update: Partial<OrderItems>,
  { trx }: trx = {}
): Promise<OrderItems | null> => {
  const query: Knex.QueryBuilder<OrderItems, OrderItems[]> = (trx || knex)<OrderItems>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as OrderItems;
};

export const getOrderItemsForUsers = async ({ order_id }: PaginationParams): Promise<Partial<OrderItems>[] | count> => {
  const columns = [
    "oi.order_item_id",
    "p.name",
    knex.raw("oi.qty::numeric * oi.price::numeric as price"),
    "oi.qty",
    "oi.price as per_price",
    "oi.order_status",
  ];
  const query = knex(`${tablename} as oi`)
    .select(columns)
    .where({ order_id })
    .join(`${TABLE_NAME.PRODUCT} as p`, "p.product_id", "oi.product_id")
    .orderBy("p.name", "asc");

  return query;
};

export const getOrderItemsByIdForUser = async (
  order_item_id: string,
  { trx }: trx = {}
): Promise<OrderItems | null> => {
  if (!order_item_id) throw new Error("OrderItems ID is required");

  const query = (trx || knex)(`${tablename} as o`).select("*").where({ order_item_id }).first();
  return query;
};
