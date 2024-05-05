import Joi from "joi";
import validators from "./common";

const addressObj = {
  user_id: validators.uuid.required(),
  customer_name: validators.fullname.required(),
  phone_number: validators.phone.required(),
  address_nickname: validators.fullname.required(),
  address_line: validators.address.required(),
  city: validators.fullname.required(),
  state: validators.fullname.required(),
  pincode: validators.pincode.required(),
  instructions: validators.description.required(),

};
const newAddress = Joi.object(addressObj);

const oldAddress = Joi.object({
  ...addressObj,
  address_id: validators.uuid.required(),
});

export default { newAddress, oldAddress };
