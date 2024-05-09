interface Address {
  address_id: string;
  user_id: string;
  customer_name: string;
  phone_number: string;
  address_nickname: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export default Address;
