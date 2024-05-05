import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { Product, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.PRODUCT;

export const createProduct = async (
  object: Partial<Product>,
  product_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<Product | null> => {
  object.product_id = product_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as Product;
};

export const getProductById = async (product_id: string, { trx }: trx = {}): Promise<Product | null> => {
  if (!product_id) throw new Error("Product ID is required");
  const query = (trx || knex)(tablename).where({ product_id }).where({ is_deleted: false }).select("*").first();
  return query;
};

export const getAllProducts = async ({
  limit,
  skip,
  totalRecords = false,
  category_id,
}: PaginationParams): Promise<Partial<Product>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(product_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "p.product_id",
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
    .join(`${TABLE_NAME.CATEGORY} as c`, "p.category_id", "c.category_id")
    .join(`${TABLE_NAME.ADMIN} as cb`, "p.created_by", "cb.admin_id")
    .join(`${TABLE_NAME.ADMIN} as ub`, "p.updated_by", "ub.admin_id")
    .orderBy("p.name", "asc");

  if (category_id) {
    query = query.where({ category_id });
  }

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getProductByFilter = async (filter: Partial<Product>, { trx }: trx = {}): Promise<Product | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const getProductsByFilter = async (filter: Partial<Product>, { trx }: trx = {}): Promise<Product[]> => {
  const query = (trx || knex)(tablename).select("*").where(filter);
  // console.log(query.toString());
  return query;
};

export const updateProduct = async (
  filter: Partial<Product>,
  update: Partial<Product>,
  { trx }: trx = {}
): Promise<Product | null> => {
  const query: Knex.QueryBuilder<Product, Product[]> = (trx || knex)<Product>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as Product;
};

export const softDeleteProduct = async (filter: Partial<Product>, { trx }: trx = {}): Promise<void> => {
  return (trx || knex)(tablename).returning("*").where(filter).update({ is_deleted: true });
};

export const getProductsForUsers = async ({
  limit,
  skip,
  totalRecords = false,
  category_id,
}: PaginationParams): Promise<Partial<Product>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(product_id) as count")).first();
    return countQuery;
  }
  const columns = ["p.product_id", "p.name", "p.description", "p.price", "p.available_stock", "c.name as category"];

  const filter = {
    is_deleted: false,
    ...(category_id && { "p.category_id": category_id }),
  };

  let query = knex(`${tablename} as p`)
    .select(columns)
    .where(filter)
    .join(`${TABLE_NAME.CATEGORY} as c`, "p.category_id", "c.category_id")
    .orderBy("p.name", "asc");

  if (category_id) {
    query = query.where({ category_id });
  }

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getProductByIdForUser = async (product_id: string, { trx }: trx = {}): Promise<Product | null> => {
  if (!product_id) throw new Error("Product ID is required");
  const columns = ["p.product_id", "p.name", "p.description", "p.price", "p.available_stock", "c.name as category"];

  const query = (trx || knex)(`${tablename} as p`)
    .select(columns)
    .where({ product_id, is_deleted: false })
    .join(`${TABLE_NAME.CATEGORY} as c`, "c.category_id", "p.category_id")
    .first();
  return query;
};
