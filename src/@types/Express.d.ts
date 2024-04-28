import { Request as ExpressRequest } from "express";
import { Admin, User } from "./database";
import { requestId } from "./Common";

export interface Request extends ExpressRequest {
  requestId?: requestId;
}

export interface AdminRequest extends Request {
  admin_id?: string;
  user_type?: "admin";
  admin?: Admin;
}

export interface CustomerRequest extends Request {
  user_id?: string;
  user_type?: "user";
  user?: User;
}
