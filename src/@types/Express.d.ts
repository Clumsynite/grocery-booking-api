import { Request as ExpressRequest } from "express";
import { Admin, User } from "./database";

export interface Request extends ExpressRequest {
  requestId?: string;
}

export interface AdminRequest extends Request {
  user_id?: string;
  user_type?: "admin";
  admin?: Admin;
  role_created_by?: string;
  role_name?: string;
  method_type?: string;
}

export interface CustomerRequest extends Request {
  customer_id?: string;
  user_type?: "user";
  user?:User;
}
