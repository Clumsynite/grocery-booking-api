import dotenv from "dotenv";

import joi from "joi";
import { LogLevel } from "../@types/Logger";
import validators from "../validators";

dotenv.config();
dotenv.config({ path: "../.env" }); // required to migrate | gives error when migrating from script

const envVarsSchema = joi
  .object()
  .keys({
    APP_NAME: joi.string().required(),
    NODE_ENV: joi.string().valid("production", "development", "staging").required(),

    PORT: joi.number().positive().required(),

    LOG_LEVEL: joi.string().valid("http", "debug", "silly", "info", "warn", "error").required(),
    LOG_TO_FILE: joi.string().optional().allow(null, "").description("Should be 'true' to create local log files"),
    LOG_FORMAT: joi.string().valid("JSON", "PRETTY_PRINT").required(),
    LOG_SENSITIVE_DATA: joi.string().valid("true", "", null, "false").optional(),

    DB_DATABASE: joi.string().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().positive().required(),

    JWT_SECRET: joi.string().required(),
    JWT_EXPIRY: joi.number().positive().required(),

    SEED_ADMIN_USERNAME: joi.string().optional(),
    SEED_ADMIN_PASSWORD: joi.string().optional(),
    SEED_ADMIN_EMAIL: joi.string().optional(),
  })
  .unknown()
  .when(joi.object({ NODE_ENV: "production" }).unknown(), {
    then: joi.object().append({
      SEND_ADMIN_OTP: joi.string().valid("true").required(),
      SES_FROM_EMAIL: validators.common.email.required(),
    }),
  });

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  APP_NAME: envVars.APP_NAME as string,
  NODE_ENV: envVars.NODE_ENV as string,
  PORT: envVars.PORT,

  // logger
  LOG_LEVEL: envVars.LOG_LEVEL as LogLevel,
  LOG_TO_FILE: envVars.LOG_TO_FILE === "true",
  LOG_FORMAT: envVars.LOG_FORMAT as string,
  LOG_SENSITIVE_DATA: envVars.LOG_SENSITIVE_DATA === "true",

  // db
  DB_DATABASE: envVars.DB_DATABASE as string,
  DB_USER: envVars.DB_USER as string,
  DB_PASSWORD: envVars.DB_PASSWORD as string,
  DB_HOST: envVars.DB_WRITER_HOST as string,
  DB_PORT: envVars.DB_PORT as number,

  // JWT
  JWT_SECRET: envVars.JWT_SECRET as string,
  JWT_EXPIRY: envVars.JWT_EXPIRY as string,

  // SEED
  SEED_ADMIN_USERNAME: (envVars.SEED_ADMIN_USERNAME || "admin") as string,
  SEED_ADMIN_PASSWORD: (envVars.SEED_ADMIN_PASSWORD || "P@ssw0rd") as string,
  SEED_ADMIN_EMAIL: (envVars.SEED_ADMIN_EMAIL || "abc@email.com") as string,
};
