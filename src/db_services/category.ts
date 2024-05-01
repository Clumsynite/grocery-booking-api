import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { Category, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { DropdownObject, PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.CATEGORY;

export const createCategory = async (
  object: Partial<Category>,
  category_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<Category | null> => {
  object.category_id = category_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as Category;
};

export const getCategoryById = async (category_id: string, { trx }: trx = {}): Promise<Category | null> => {
  if (!category_id) throw new Error("Category ID is required");
  const query = (trx || knex)(tablename).where({ category_id }).where({ is_deleted: false }).select("*").first();
  return query;
};

export const getAllCategories = async ({
  limit,
  skip,
  totalRecords = false,
}: PaginationParams): Promise<Partial<Category>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(category_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "c.category_id",
    "c.name",
    "c.description",
    "c.created_at",
    "c.updated_at",
    "cb.username as created_by",
    "ub.username as updated_by",
  ];
  let query = knex(`${tablename} as c`)
    .select(columns)
    .join(`${TABLE_NAME.ADMIN} as cb`, "c.created_by", "cb.admin_id")
    .join(`${TABLE_NAME.ADMIN} as ub`, "c.updated_by", "ub.admin_id")
    .orderBy("c.name", "asc");

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getCategoryByFilter = async (filter: Partial<Category>, { trx }: trx = {}): Promise<Category | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const updateCategory = async (
  filter: Partial<Category>,
  update: Partial<Category>,
  { trx }: trx = {}
): Promise<Category | null> => {
  const query: Knex.QueryBuilder<Category, Category[]> = (trx || knex)<Category>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as Category;
};

export const hardDeleteCategory = async (filter: Partial<Category>, { trx }: trx = {}): Promise<void> => {
  return (trx || knex)(tablename).returning("*").where(filter).del();
};

export const getCategoriesForDropdown = async (): Promise<DropdownObject[]> => {
  const columns = ["category_id as value", "name as label"];
  const query = knex(tablename).select(columns).where({ is_deleted: false }).orderBy("name", "asc");
  // console.log(query.toString());
  return query as unknown as DropdownObject[];
};
