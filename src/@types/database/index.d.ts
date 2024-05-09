import Admin from "./Admin";
import User from "./User";
import Address from "./Address";
import Category from "./Category";
import Product from "./Product";
import CartItem from "./CartItem";
import Order from "./Order";
import OrderItems from "./OrderItems";

export { Admin, User, Address, Category, Product, CartItem, Order, OrderItems };

export const enum TABLE_NAME {
  ADMIN = "admin",
  USER = "user",
  ADDRESS = "address",
  CATEGORY = "category",
  PRODUCT = "product",
  CART_ITEM = "cart_item",
  ORDER = "order",
  ORDER_ITEMS = "order_items",
}
