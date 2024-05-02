import { Response } from "express";
import bcrypt from "bcrypt";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";

import * as userService from "../../db_services/user";
import { User } from "../../@types/database";
import { count } from "../../@types/Knex";
import validators from "../../validators";

const register = async (req: UserRequest, res: Response) => {
  const { body, requestId, user_id: created_by } = req;
  try {
    const { password, email, cnf_password, full_name } = body;

    const validator = validators.user.newUserValidator.validate({
      password,
      email,
      cnf_password,
      full_name,
    });
    if (validator.error) {
      const message = validator.error.message;
      logger.debug("Validation error while creating user user", { body, message, requestId });
      return res.status(400).json({
        status: false,
        message,
        data: null,
      });
    }

    const emailExists = await userService.getUserByFilter({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        status: false,
        message: "Email already exists!",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const encPassword = await bcrypt.hash(password, salt);

    const newUserObj = {
      full_name: full_name,
      password: encPassword,
      email: email.toLowerCase(),
      created_by,
      updated_by: created_by,
    };

    const user = await userService.createUser(newUserObj);

    return res.status(201).json({
      status: true,
      message: "User created successfully.",
      data: { ...user, password: "" },
    });
  } catch (err) {
    const message = "Error while creating user user";
    logger.error(message, { err, requestId });
    return res.status(500).json({
      status: false,
      message: message,
      data: null,
    });
  }
};

const getUserUsers = async (req: UserRequest, res: Response) => {
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

const updateUser = async (req: UserRequest, res: Response) => {
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

const deleteUser = async (req: UserRequest, res: Response) => {
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
  register,
  getUserUsers,
  getUserById,
  updateUser,
  deleteUser,
};
