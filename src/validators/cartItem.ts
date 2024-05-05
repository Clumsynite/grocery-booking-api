import Joi from "joi";
import validators from "./common";

const cartItemObj = {
  user_id: validators.uuid.required(),
  product_id: validators.uuid.required(),
  // qty: validators.amount.integer().required(),
  qty: Joi.number().integer().min(0).required(),
};
const newCartItem = Joi.object(cartItemObj);

const oldCartItem = Joi.object({
  ...cartItemObj,
  qty: Joi.number().integer().min(0).required(),
  cart_item_id: validators.uuid.required(),
});

export default { newCartItem, oldCartItem };
