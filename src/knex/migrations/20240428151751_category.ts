import { Knex } from "knex";
import { TABLE_NAME } from "../..//@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.CATEGORY, (table) => {
    table.uuid("category_id").primary();
    table.string("name").notNullable();
    table.string("description").notNullable();
    table.uuid("created_by").notNullable().references("admin_id").inTable(TABLE_NAME.ADMIN).onDelete("restrict");
    table.uuid("updated_by").nullable().references("admin_id").inTable(TABLE_NAME.ADMIN).onDelete("restrict");
    table.timestamps(false, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.PRODUCT);
}
