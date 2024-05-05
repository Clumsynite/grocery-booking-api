import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

import { count, trx } from "../@types/Knex";
import { Address, TABLE_NAME } from "../@types/database";

import knex from "../knex";

import { PaginationParams } from "../@types/Common";

const tablename = TABLE_NAME.ADDRESS;

export const createAddress = async (
  object: Partial<Address>,
  address_id: string = uuidv4(),
  { trx }: trx = {}
): Promise<Address | null> => {
  object.address_id = address_id;
  const query = (trx || knex)(tablename).returning("*").insert(object);
  const result = await query;
  return result?.[0] as unknown as Address;
};

export const getAddressById = async (address_id: string, { trx }: trx = {}): Promise<Address | null> => {
  if (!address_id) throw new Error("Address ID is required");
  const query = (trx || knex)(tablename).where({ address_id }).where({ is_deleted: false }).select("*").first();
  return query;
};

export const getAllAddresses = async ({
  limit,
  skip,
  totalRecords = false,
  user_id,
}: PaginationParams): Promise<Partial<Address>[] | count> => {
  if (totalRecords) {
    const countQuery = knex(tablename).select(knex.raw("count(address_id) as count")).first();
    return countQuery;
  }
  const columns = [
    "a.address_id",
    "a.user_id",
    "a.customer_name",
    "a.phone_number",
    "a.address_nickname",
    "a.address_line",
    "a.city",
    "a.state",
    "a.pincode",
    "a.instructions",
    "a.created_at",
    "a.updated_at",
    "a.is_deleted",
    "u.full_name",
    "u.email",
  ];
  let query = knex(`${tablename} as a`)
    .select(columns)
    .join(`${TABLE_NAME.USER} as u`, "a.user_id", "u.user_id")
    .orderBy("a.created_at", "desc");

  if (user_id) {
    query = query.where({ user_id });
  }

  if (limit) query = query.limit(limit).offset(skip || 0);
  // console.log(query.toString());
  return query;
};

export const getAddressByFilter = async (filter: Partial<Address>, { trx }: trx = {}): Promise<Address | null> => {
  const query = (trx || knex)(tablename).select("*").where(filter).first();
  // console.log(query.toString());
  return query;
};

export const getAddressesByFilter = async (filter: Partial<Address>, { trx }: trx = {}): Promise<Address[]> => {
  const query = (trx || knex)(tablename).select("*").where(filter);
  // console.log(query.toString());
  return query;
};

export const updateAddress = async (
  filter: Partial<Address>,
  update: Partial<Address>,
  { trx }: trx = {}
): Promise<Address | null> => {
  const query: Knex.QueryBuilder<Address, Address[]> = (trx || knex)<Address>(tablename)
    .returning("*")
    .where(filter)
    .update({ ...update, updated_at: knex.fn.now() });
  const result = await query;
  return result[0] as unknown as Address;
};

export const softDeleteAddress = async (filter: Partial<Address>, { trx }: trx = {}): Promise<void> => {
  return (trx || knex)(tablename).returning("*").where(filter).update({ is_deleted: true });
};
