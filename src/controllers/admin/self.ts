import { Response } from "express";

import logger from "../../utils/logger";
import { AdminRequest } from "../../@types/Express";

import * as adminService from "../../db_services/admin";

const getProfile = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId } = req;
  try {
    if (!admin_id)
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });

    const admin = await adminService.getAdminById(admin_id);

    const resObj = {
      username: admin?.username,
      email: admin?.email,
      last_login_ip: admin?.last_login_ip,
      last_login_timestamp: admin?.last_login_timestamp,
      password_changed_at: admin?.password_changed_at,
      created_at: admin?.created_at,
    };

    return res.status(200).json({ status: true, message: "Profile Info.", data: resObj });
  } catch (err) {
    const message = "Error while fetching profile info";
    logger.error(message, { err, admin_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  getProfile,
};
