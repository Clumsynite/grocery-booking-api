import { Knex } from "knex";
import { TABLE_NAME } from "../..//@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.CART, (table) => {
    table.uuid("cart_id").primary();
    table.uuid("user_id").notNullable().references("user_id").inTable(TABLE_NAME.USER).onDelete("restrict");
    table.integer("qty").notNullable();
    table.uuid("product_id").nullable().references("product_id").inTable(TABLE_NAME.PRODUCT).onDelete("restrict");
    table.timestamps(false, true);
    table.boolean("is_deleted").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.CART);
}
