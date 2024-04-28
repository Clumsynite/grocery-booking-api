import { order_status } from "../Common";

interface OrderItems {
  order_item_id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  price: number;
  qty: number;
  order_status: order_status;
  created_at: string;
  updated_at: string;
}

export default OrderItems;
