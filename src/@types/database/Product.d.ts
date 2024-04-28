interface Product {
  product_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  available_stock: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export default Product;
