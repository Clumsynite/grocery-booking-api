import { Knex } from "knex";
import { TABLE_NAME } from "../..//@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.ORDER_ITEMS, (table) => {
    table.uuid("order_item_id").primary();
    table.uuid("order_id").notNullable().references("order_id").inTable(TABLE_NAME.ORDER).onDelete("restrict");
    table.uuid("user_id").notNullable().references("user_id").inTable(TABLE_NAME.USER).onDelete("restrict");
    table.uuid("product_id").notNullable().references("product_id").inTable(TABLE_NAME.PRODUCT).onDelete("restrict");
    table.decimal("price").notNullable();
    table.integer("qty").notNullable();
    table.string("order_status").notNullable();
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.ORDER_ITEMS);
}
