import { Knex } from "knex";
import { TABLE_NAME } from "@src/@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.PRODUCT, (table) => {
    table.uuid("product_id").primary();
    table.uuid("category_id").notNullable().references("category_id").inTable(TABLE_NAME.PRODUCT).onDelete("restrict");
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.decimal("price").notNullable();
    table.integer("available_stock").notNullable();
    table.uuid("created_by").notNullable().references("admin_id").inTable(TABLE_NAME.ADMIN).onDelete("restrict");
    table.uuid("updated_by").nullable().references("admin_id").inTable(TABLE_NAME.ADMIN).onDelete("restrict");
    table.timestamps(false, true);
    table.boolean("is_deleted").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.PRODUCT);
}
