import Joi from "joi";
import validators from "./common";

const newUserValidator = Joi.object({
  email: validators.email.required(),
  password: validators.password.required(),
  cnf_password: Joi.ref("password"),
  full_name: validators.fullname.required(),
}).with("password", "cnf_password");

const loginValidator = Joi.object({
  email: validators.email.required(),
  password: validators.password.required(),
});

const updatePasswordValidator = Joi.object({
  old_password: validators.password.required(),
  new_password: validators.password.required(),
  cnf_password: Joi.ref("new_password"),
}).with("new_password", "cnf_password");

const updateUserValidation = Joi.object({
  user_id: validators.uuid.required(),
  email: validators.email.required(),
  full_name: validators.fullname.required(),
});

export default {
  newUserValidator,
  loginValidator,
  updatePasswordValidator,
  updateUserValidation,
};
