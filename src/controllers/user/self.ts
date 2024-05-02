import { Response } from "express";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";

// import * as userService from "../../db_services/user";

const getProfile = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, user } = req;
  try {
    if (!user_id || !user)
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });

    // const user = await userService.getUserById(user_id);

    const resObj = {
      email: user.email,
      full_name: user.full_name,
      last_login_ip: user.last_login_ip,
      last_login_timestamp: user.last_login_timestamp,
      password_changed_at: user.password_changed_at,
      created_at: user.created_at,
    };

    return res.status(200).json({ status: true, message: "Profile Info.", data: resObj });
  } catch (err) {
    const message = "Error while fetching profile info";
    logger.error(message, { err, user_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  getProfile,
};
