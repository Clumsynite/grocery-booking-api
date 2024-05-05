interface CartItem {
  cart_item_id: string;
  user_id: string;
  product_id: string;
  qty: string;
  created_at: string;
  updated_at: string;
}

export interface CartItemsForUser {
  product_id: string;
  name: string;
  description: string;
  per_price: string;
  category: string;
  cart_item_id: string;
  qty: number;
  created_at: string;
  updated_at: string;
  price: string;
}

export default CartItem;
