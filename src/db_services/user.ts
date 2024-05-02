import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { User, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.USER;

export const createUser = async (
  object: Partial<User>,
  user_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<User | null> => {
  object.user_id = user_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as User;
};

export const getUserById = async (user_id: string, { trx }: trx = {}): Promise<User | null> => {
  if (!user_id) throw new Error("User ID is required");
  const query = (trx || knex)(tablename).where({ user_id }).where({ is_deleted: false }).select("*").first();
  return query;
};

export const getAllUsers = async ({
  limit,
  skip,
  totalRecords = false,
}: PaginationParams): Promise<Partial<User>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(user_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "u.user_id",
    "u.username",
    "u.email",
    "u.full_name",
    "u.last_login_ip",
    "u.last_login_timestamp",
    "u.is_deleted",
    "u.created_at",
    "u.updated_at",
  ];
  let query = knex(`${tablename} as u`).select(columns).orderBy("username", "asc");

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getUserByFilter = async (filter: Partial<User>, { trx }: trx = {}): Promise<User | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const updateUser = async (
  filter: Partial<User>,
  update: Partial<User>,
  { trx }: trx = {}
): Promise<User | null> => {
  const query: Knex.QueryBuilder<User, User[]> = (trx || knex)<User>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as User;
};

export const softDeleteUser = async (filter: Partial<User>, { trx }: trx = {}): Promise<void> => {
  return (trx || knex)(tablename).returning("*").where(filter).update({ is_deleted: true });
};
