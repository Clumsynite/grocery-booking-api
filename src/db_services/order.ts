import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { Order, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.ORDER;

export const createOrder = async (
  object: Partial<Order>,
  order_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<Order | null> => {
  object.order_id = order_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as Order;
};

export const getOrderById = async (order_id: string, { trx }: trx = {}): Promise<Order | null> => {
  if (!order_id) throw new Error("Order ID is required");
  const query = (trx || knex)(tablename).where({ order_id }).select("*").first();
  return query;
};

export const getAllOrders = async ({
  limit,
  skip,
  totalRecords = false,
  user_id,
}: PaginationParams): Promise<Partial<Order>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(order_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "p.order_id",
    "p.name",
    "p.description",
    "p.price",
    "p.available_stock",
    "p.created_at",
    "p.updated_at",
    "p.is_deleted",
    "cb.username as created_by",
    "ub.username as updated_by",
  ];
  let query = knex(`${tablename} as p`)
    .select(columns)
    .join(`${TABLE_NAME.CATEGORY} as c`, "p.user_id", "c.user_id")
    .join(`${TABLE_NAME.ADMIN} as cb`, "p.created_by", "cb.admin_id")
    .join(`${TABLE_NAME.ADMIN} as ub`, "p.updated_by", "ub.admin_id")
    .orderBy("p.name", "asc");

  if (user_id) {
    query = query.where({ user_id });
  }

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getOrderByFilter = async (filter: Partial<Order>, { trx }: trx = {}): Promise<Order | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const getOrdersByFilter = async (filter: Partial<Order>, { trx }: trx = {}): Promise<Order[]> => {
  const query = (trx || knex)(tablename).select("*").where(filter);
  // console.log(query.toString());
  return query;
};

export const updateOrder = async (
  filter: Partial<Order>,
  update: Partial<Order>,
  { trx }: trx = {}
): Promise<Order | null> => {
  const query: Knex.QueryBuilder<Order, Order[]> = (trx || knex)<Order>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as Order;
};

export const getOrdersForUsers = async ({
  limit,
  skip,
  totalRecords = false,
  user_id,
}: PaginationParams): Promise<Partial<Order>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(order_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "o.order_id",
    "o.user_id",
    "o.total_amount",
    "o.payment_mode",
    "o.order_status",
    "o.item_count",
    "o.user_instruction",
    "o.admin_remarks",
    "o.ordered_at",
    "o.shipped_at",
    "o.out_for_delivery_at",
    "o.delivery_at",
    "o.returned_at",
    "o.created_at",
    "o.updated_at",
    "o.address_id",
    "o.customer_name",
    "o.phone_number",
    "o.address_nickname",
    "o.address_line",
    "o.city",
    "o.state",
    "o.pincode",
    "o.instructions",
  ];

  let query = knex(`${tablename} as o`).select(columns).where({ user_id }).orderBy("p.name", "asc");

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getOrderByIdForUser = async (order_id: string, { trx }: trx = {}): Promise<Order | null> => {
  if (!order_id) throw new Error("Order ID is required");

  const query = (trx || knex)(`${tablename} as o`).select("*").where({ order_id }).first();
  return query;
};
