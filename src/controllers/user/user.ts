import { Response } from "express";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";

import * as userService from "../../db_services/user";
import { User } from "../../@types/database";
import { count } from "../../@types/Knex";
import validators from "../../validators";


const getUsers = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, query } = req;
  try {
    const { limit: qLimit, skip: qSkip } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;

    const users = (await userService.getAllUsers({ limit, skip })) as Partial<User>[];
    let count = 0;

    if (users?.length) {
      const allRolesCount = (await userService.getAllUsers({
        limit: null,
        skip: null,
        totalRecords: true,
      })) as count;
      count = Number(allRolesCount?.count);
    }

    return res
      .header("Access-Control-Expose-Headers", "x-total-count")
      .setHeader("x-total-count", count)
      .status(200)
      .json({
        status: true,
        message: "Users Fetched Successfully",
        data: users,
      });
  } catch (err) {
    const message = "Error while fetching all user users";
    logger.error(message, { err, user_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getUserById = async (req: UserRequest, res: Response) => {
  const { requestId, params } = req;
  const { user_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(user_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "User User ID is invalid",
        data: null,
      });
    }

    const userData = await userService.getUserById(user_id);
    if (!userData) {
      return res.status(400).json({
        status: false,
        message: "User User not found",
        data: null,
      });
    }
    return res.status(200).json({ status: true, message: "User User Found", data: { user: userData } });
  } catch (err) {
    const message = "Error while Fetching User Users";
    logger.error(message, { err, requestId, user_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  getUsers,
  getUserById,
};
