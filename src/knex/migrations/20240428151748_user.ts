import { Knex } from "knex";
import { TABLE_NAME } from "../..//@types/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME.USER, (table) => {
    table.uuid("user_id").primary();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.string("full_name").notNullable();
    table.string("last_login_ip").defaultTo(null);
    table.timestamp("last_login_timestamp");
    table.timestamp("password_changed_at").defaultTo(null);
    table.timestamps(false, true);
    table.boolean("is_deleted").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME.USER);
}
