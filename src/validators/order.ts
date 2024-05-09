import Joi from "joi";
import validators from "./common";

const newOrderObj = {
  user_id: validators.uuid.required(),
  payment_mode: validators.paymentMode.required(),
  user_instructions: validators.description.optional(),
  address_id: validators.uuid.required(),
};

const newOrder = Joi.object(newOrderObj);

const oldOrder = Joi.object({
  ...newOrderObj,
  order_id: validators.uuid.required(),
  order_status: validators.status.required(),
  admin_remarks: validators.description.optional(),
});

export default { newOrder, oldOrder };
