import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { CartItem, TABLE_NAME } from "../@types/database";

import knex from "../knex";

const tablename = TABLE_NAME.CART_ITEM;

export const createCartItem = async (
  object: Partial<CartItem>,
  cart_item_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<CartItem | null> => {
  object.cart_item_id = cart_item_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as CartItem;
};

export const getCartItemById = async (cart_item_id: string, { trx }: trx = {}): Promise<CartItem | null> => {
  if (!cart_item_id) throw new Error("Cart Item ID is required");

  const columns = [
    "p.product_id",
    "p.name",
    "p.description",
    "p.price as per_price",
    // "p.available_stock",
    "c.name as category",
    "ci.cart_item_id",
    "ci.qty",
    "ci.created_at",
    "ci.updated_at",
    knex.raw("ci.qty::numeric * p.price::numeric as price"),
  ];

  const query = (trx || knex)(tablename)
    .select(columns)
    .where({ cart_item_id })
    .join(`${TABLE_NAME.PRODUCT} as p`, "p.product_id", "ci.product_id")
    .join(`${TABLE_NAME.CATEGORY} as c`, "c.category_id", "p.category_id")
    .first();
  return query;
};

export const getCartItemsForUser = async ({ user_id }: { user_id: string }): Promise<Partial<CartItem>[] | count> => {
  const columns = [
    "p.product_id",
    "p.name",
    "p.description",
    "p.price as per_price",
    // "p.available_stock",
    "c.name as category",
    "ci.cart_item_id",
    "ci.qty",
    "ci.created_at",
    "ci.updated_at",
    knex.raw("ci.qty::numeric * p.price::numeric as price"),
  ];

  const query = knex(`${tablename} as ci`)
    .select(columns)
    .where({ user_id })
    .join(`${TABLE_NAME.PRODUCT} as p`, "p.product_id", "ci.product_id")
    .join(`${TABLE_NAME.CATEGORY} as c`, "c.category_id", "p.category_id")
    .orderBy("ci.created_at", "desc");

  // console.log(query.toString());
  return query;
};

export const getCartItemByFilter = async (filter: Partial<CartItem>, { trx }: trx = {}): Promise<CartItem | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const getCartIemsByFilter = async (filter: Partial<CartItem>, { trx }: trx = {}): Promise<CartItem[]> => {
  const query = (trx || knex)(tablename).select("*").where(filter);
  // console.log(query.toString());
  return query;
};

export const updateCartItem = async (
  filter: Partial<CartItem>,
  update: Partial<CartItem>,
  { trx }: trx = {}
): Promise<CartItem | null> => {
  const query: Knex.QueryBuilder<CartItem, CartItem[]> = (trx || knex)<CartItem>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as CartItem;
};

export const hardDeleteCartItem = async (filter: Partial<CartItem>, { trx }: trx = {}): Promise<void> => {
  return (trx || knex)(tablename).returning("*").where(filter).del();
};
