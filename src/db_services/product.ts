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
    "p.created_at",
    "p.updated_at",
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
