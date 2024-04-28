import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { Admin, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.ADMIN;

export const createAdmin = async (
  object: Partial<Admin>,
  admin_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<Admin | null> => {
  object.admin_id = admin_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as Admin;
};

export const getAdminById = async (admin_id: string, { trx }: trx = {}): Promise<Admin | null> => {
  if (!admin_id) throw new Error("Admin ID is required");
  const query = (trx || knex)(tablename).where({ admin_id }).where({ is_deleted: false }).select("*").first();
  return query;
};

export const getAllAdmins = async ({
  limit,
  skip,
  totalRecords = false,
}: PaginationParams): Promise<Partial<Admin>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(admin_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "au.admin_id",
    "au.username",
    "au.email",
    "au.last_login_ip",
    "au.last_login_timestamp",
    "au.is_deleted",
    "au.created_at",
    "au.updated_at",
    "cb.username as created_by",
    "ub.username as updated_by",
    "r.role_name",
  ];
  let query = knex(`${tablename} as au`)
    .select(columns)
    .leftJoin("admin_user as cb", "au.created_by", "cb.admin_id")
    .leftJoin("admin_user as ub", "au.updated_by", "ub.admin_id")
    .orderBy("au.username", "asc");

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getAdminByFilter = async (filter: Partial<Admin>, { trx }: trx = {}): Promise<Admin | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const updateAdmin = async (
  filter: Partial<Admin>,
  update: Partial<Admin>,
  { trx }: trx = {}
): Promise<Admin | null> => {
  const query: Knex.QueryBuilder<Admin, Admin[]> = (trx || knex)<Admin>(tablename)
    .returning("*")
    .where(filter)
    .update(update);
  const result = await query;
  return result[0] as unknown as Admin;
};

export const softDeleteAdmin = async (filter: Partial<Admin>, { trx }: trx = {}): Promise<void> => {
  return (trx || knex)(tablename).returning("*").where(filter).update({ is_deleted: true });
};
