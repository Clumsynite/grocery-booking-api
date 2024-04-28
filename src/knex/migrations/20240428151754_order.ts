import { Knex } from "knex";
import { TABLE_NAME } from "@src/@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.ORDER, (table) => {
    table.uuid("order_id").primary();
    table.uuid("user_id").notNullable().references("user_id").inTable(TABLE_NAME.USER).onDelete("restrict");
    table.decimal("total_amount").notNullable();
    table.string("payment_mode").notNullable();
    table.string("order_status").notNullable();
    table.integer("item_count").notNullable();
    table.string("user_instructions").nullable();
    table.string("admin_remarks").nullable();
    table.timestamp("ordered_at").nullable().defaultTo(null);
    table.timestamp("shipped_at").nullable().defaultTo(null);
    table.timestamp("out_for_delivery_at").nullable().defaultTo(null);
    table.timestamp("delivery_at").nullable().defaultTo(null);
    table.timestamp("returned_at").nullable().defaultTo(null);
    table.timestamps(false, true);
    // data from address table
    table.uuid("address_id").notNullable().references("address_id").inTable(TABLE_NAME.ADDRESS).onDelete("restrict");
    table.string("customer_name").notNullable();
    table.string("phone_number").notNullable();
    table.string("address_nickname").notNullable();
    table.string("address_line").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.string("pincode").notNullable();
    table.string("instructions").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.ORDER);
}
