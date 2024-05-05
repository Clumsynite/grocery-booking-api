import { Response } from "express";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";
import * as userService from "../../db_services/user";

import validators from "../..//validators";

const getProfile = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, user } = req;
  try {
    if (!user_id || !user)
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });

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

const updateProfile = async (req: UserRequest, res: Response) => {
  const { requestId, body, user_id } = req;
  try {
    const { email, full_name }: { email: string; full_name: string } = body;

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });
    }

    const bodyValidation = validators.user.updateUserValidation.validate({
      email,
      user_id,
      full_name,
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
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

    const emailExists = await userService.getUserByFilter({ email: email.toLowerCase() });
    if (emailExists && emailExists.user_id !== user_id) {
      return res.status(400).json({
        status: false,
        message: "Email already exists",
        data: null,
      });
    }

    const updateObj = {
      email,
      full_name,
      is_deleted: userData?.is_deleted,
    };

    const userObj = await userService.updateUser({ user_id }, updateObj);

    return res.status(200).json({ status: true, message: "User User Updated Successfully", data: { user: userObj } });
  } catch (err) {
    const message = "Error while updated user user";
    logger.error(message, { err, requestId, body, user_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const deleteProfile = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params, body } = req;

  try {
    const { is_deleted }: { is_deleted: boolean } = body;
    const operation = is_deleted ? "disabled" : "enabled";

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });
    }

    const validator = validators.common.isDeleted.required().validate({ id: user_id, is_deleted });
    if (validator.error) {
      return res.status(400).json({
        status: false,
        message: "User User ID is invalid",
        data: null,
      });
    }

    const userData = await userService.getUserByFilter({ user_id });
    if (!userData) {
      return res.status(400).json({
        status: false,
        message: "User User not found",
        data: null,
      });
    }

    if (userData?.is_deleted === is_deleted) {
      return res.status(200).json({ status: true, message: `User User was already ${operation}`, data: null });
    }

    await userService.updateUser({ user_id }, { is_deleted });

    return res.status(200).json({ status: true, message: `User User ${operation} successfully`, data: null });
  } catch (err) {
    const message = "Error while deleting user user";
    logger.error(message, { err, user_id, requestId, params, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  getProfile,
  updateProfile,
  deleteProfile,
};
