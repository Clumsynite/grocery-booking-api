import { Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import moment from "moment";

import { AdminRequest } from "../@types/Express";
import config from "../config";
import logger from "../utils/logger";

import * as adminService from "../db_services/admin";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    id?: string;
    type?: "user" | "admin";
    iat?: number;
    name?: string;
    email?: string;
  }
}

export default async (req: AdminRequest, res: Response, next: NextFunction) => {
  const { requestId } = req;
  try {
    let token = req.headers["authorization"] || req.headers["x-access-token"] || req.query.token || req.body.token;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "A token is required for authentication",
        data: null,
      });
    }
    if (req.query.token) {
      token = req.query.token;
    } else {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;

    const admin_id = decoded.id;

    if (!admin_id) {
      return res.status(403).json({ status: false, message: "Invalid Token!", data: null });
    }

    if (decoded.type !== "admin") {
      return res.status(403).json({ status: false, message: "Invalid User!", data: null });
    }

    const user = await adminService.getAdminById(admin_id);

    if (!user) {
      return res.status(403).json({ status: false, message: "Invalid User!", data: null });
    }

    // to check if token was signed before password change
    let token_signed_at = decoded?.iat;
    if (token_signed_at) {
      token_signed_at *= 1000;
      if (user.password_changed_at) {
        const is_token_signed_before_password_change = moment(token_signed_at).isBefore(user.password_changed_at);
        if (is_token_signed_before_password_change) {
          return res.status(403).json({ status: false, message: "Invalid Token!", data: null });
        }
      }
    }

    req.admin = user;
    req.admin_id = user.admin_id;
    return next();
  } catch (err) {
    logger.error("Error in auth middleware", { err, requestId });
    return res.status(500).json({ status: false, message: "Invalid Token!", data: null });
  }
};
