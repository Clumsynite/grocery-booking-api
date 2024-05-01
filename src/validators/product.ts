import Joi from "joi";
import validators from "./common";

const newProduct = Joi.object({
  name: validators.fullname.required(),
  description: validators.description.required(),
  category_id: validators.uuid.required(),
  price: validators.amount.required(),
  available_stock: validators.amount.integer().required(),
});

const oldProduct = Joi.object({
  name: validators.fullname.required(),
  description: validators.description.required(),
  category_id: validators.uuid.required(),
  price: validators.amount.required(),
  available_stock: validators.amount.integer().required(),
  prdocut_id: validators.uuid.required(),
});

export default { newProduct, oldProduct };
