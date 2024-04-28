import dotenv from "dotenv";
dotenv.config();

import joi from "joi";
import { LogLevel } from "../@types/Logger";

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
  })
  .unknown();

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
};
