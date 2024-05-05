// SAMPLE ADMIN SEED FILE
import { Knex } from "knex";

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

import config from "../../config";
import validators from "../../validators/common";
import { Admin, TABLE_NAME } from "@src/@types/database";

export async function seed(knex: Knex) {
  const salt = await bcrypt.genSalt(10);

  const email = config.SEED_ADMIN_EMAIL;
  const username = config.SEED_ADMIN_USERNAME;
  const password = config.SEED_ADMIN_PASSWORD;

  const passwordValidation = validators.password.required().validate(password);
  const passwordValidationError = passwordValidation?.error?.message;
  const isPasswordValid = !passwordValidationError;
  if (!isPasswordValid) {
    throw new Error(`Seed Password is invalid. \n\n${passwordValidationError}\n\n`);
  }

  const encPassword = await bcrypt.hash(password, salt);

  const adminObj: Partial<Admin> = {
    admin_id: uuidv4(),
    username,
    password: encPassword,
    is_deleted: false,
    email,
  };

  await knex(TABLE_NAME.ADMIN).del();
  await knex(TABLE_NAME.ADMIN).insert([adminObj]);
}
