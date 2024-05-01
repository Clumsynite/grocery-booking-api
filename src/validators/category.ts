import Joi from "joi";
import validators from "./common";

const newCategory = Joi.object({
  name: validators.fullname.required(),
  description: validators.description.required(),
});

const oldCategory = Joi.object({
  name: validators.fullname.required(),
  description: validators.description.required(),
  category_id: validators.uuid.required(),
});

export default { newCategory, oldCategory };
