import { Knex } from "knex";
import { TABLE_NAME } from "../..//@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.ADDRESS, (table) => {
    table.uuid("address_id").primary();
    table.uuid("user_id").notNullable().references("user_id").inTable(TABLE_NAME.USER).onDelete("restrict");
    table.string("customer_name").notNullable();
    table.string("phone_number").notNullable();
    table.string("address_nickname").notNullable();
    table.string("address_line").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.string("pincode").notNullable();
    table.string("instructions").nullable();
    table.timestamps(false, true);
    table.boolean("is_deleted").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.ADDRESS);
}
