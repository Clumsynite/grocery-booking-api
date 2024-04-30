import joi from "joi";

import regex from "./regex";

const passwordRegexMessage =
  "Password needs to have at least one digit, one special character, one lowercase letter, one uppercase letter, and a total length between 8 and 20 characters.";

// common validation
const username = joi.string().min(3).max(20).pattern(regex.username);
const fullname = joi.string().min(3).max(60);
const description = joi.string().min(3).max(200);
const password = joi.string().pattern(regex.password).message(passwordRegexMessage);
const email = joi.string().email();

const uuid = joi.string().uuid({ version: ["uuidv4"] });
const phone = joi.string().pattern(regex.phone);

const number = joi.string().pattern(regex.number);
const amount = joi.number().positive().min(1).max(10000000).messages({
  "number.positive": "Amount must be more than 0",
  "number.min": "Amount must be atleast 1",
  "number.max": "Amount must be less than 10000000",
  "number.required": "Amount is required",
});

const name = joi.string().min(3).max(25).pattern(regex.name);
const address = joi.string().min(6).max(100).pattern(regex.address);

const isDeleted = joi.object({
  id: uuid.required(),
  is_deleted: joi.boolean().required(),
});

export default {
  username,
  fullname,
  description,
  password,
  email,
  uuid,
  phone,
  amount,
  name,
  address,
  number,
  isDeleted,
};
