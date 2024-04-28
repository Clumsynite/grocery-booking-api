import Admin from "./Admin";
import User from "./User";
import Address from "./Address";
import Category from "./Category";
import Product from "./Product";
import Cart from "./Cart";
import Order from "./Order";
import OrderItems from "./OrderItems";

export { Admin, User, Address, Category, Product, Cart, Order, OrderItems };

export const enum TABLE_NAME {
  ADMIN = "admin",
  USER = "user",
  ADDRESS = "address",
  CATEGORY = "category",
  PRODUCT = "product",
  CART = "cart",
  ORDER = "order",
  ORDER_PRODUCTS = "order_products",
}
