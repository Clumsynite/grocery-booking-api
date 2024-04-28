import { Knex } from "knex";
import { TABLE_NAME } from "@src/@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.ADMIN, (table) => {
    table.uuid("admin_id").primary();
    table.string("username").unique().notNullable();
    table.string("password").notNullable();
    table.string("email").unique().notNullable();
    table.string("last_login_ip").defaultTo(null);
    table.timestamp("last_login_timestamp");
    table.timestamp("password_changed_at").defaultTo(null);
    table.uuid("created_by").nullable().references("admin_id").inTable(TABLE_NAME.ADMIN).onDelete("restrict");
    table.uuid("updated_by").nullable().references("admin_id").inTable(TABLE_NAME.ADMIN).onDelete("restrict");
    table.timestamps(false, true);
    table.boolean("is_deleted").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.ADMIN);
}
