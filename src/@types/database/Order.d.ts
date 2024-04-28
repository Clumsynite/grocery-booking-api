import { order_status, payment_mode } from "../Common";

interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  payment_mode: payment_mode;
  order_status: order_status;
  item_count: number; // product * qty
  user_instruction: string | null;
  admin_remarks: string | null;
  ordered_at: string;
  shipped_at: string | null;
  out_for_delivery_at: string | null;
  delivery_at: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
  // address table
  address_id: string;
  customer_name: string;
  phone_number: string;
  address_nickname: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string;
}

export default Order;
