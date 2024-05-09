import joi from "joi";

import { PaymentMode, Status } from "../@types/Common";
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
const pincode = joi.number().positive().min(100000).max(999999);

const paymentMode = joi.string().valid(PaymentMode.BANK, PaymentMode.CARD, PaymentMode.CASH, PaymentMode.UPI);

const status = joi
  .string()
  .valid(Status.DELIVERED, Status.OUT_FOR_DELIVERY, Status.PENDING, Status.RETURNED, Status.SHIPPED);



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
  pincode,
  paymentMode,
  status
};
