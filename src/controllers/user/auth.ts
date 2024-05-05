import { Response } from "express";
import bcrypt from "bcrypt";
import moment from "moment";

import { Request, UserRequest } from "../../@types/Express";

import validators from "../../validators";

import logger from "../../utils/logger";

import * as userService from "../../db_services/user";

import helpers from "../../helpers/helper";
import { getUserJwtToken as getJwtToken } from "../../helpers/login";

const signin = async (req: Request, res: Response) => {
  const { body, requestId } = req;
  const ip = helpers.getIp(req);
  try {
    const { email, password } = body;
    const validator = validators.user.loginValidator.validate({ email, password });
    if (validator.error) {
      const message = validator.error.message;
      logger.debug("Validation error while user signin", { body, message, requestId });
      return res.status(400).json({
        status: false,
        message,
        data: null,
      });
    }

    const userExists = await userService.getUserByFilter({ email, is_deleted: false });
    if (!userExists) {
      const message = "email or password is Invalid";
      logger.debug(message, { email, requestId });
      return res.status(400).json({
        status: false,
        message,
        data: null,
      });
    }

    const { user_id } = userExists;
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      const message = "Email or password is Invalid";
      logger.debug(message, { email, requestId });
      return res.status(400).json({
        status: false,
        message: message,
        data: null,
      });
    }

    const { token: jwtToken, data } = getJwtToken(user_id, email);

    await userService.updateUser({ user_id }, { last_login_ip: ip, last_login_timestamp: moment().toISOString() });

    return res.status(200).header("Access-Control-Expose-Headers", "token").setHeader("token", jwtToken).json({
      status: true,
      message: "Successfully Signed in!",
      data,
    });
  } catch (err) {
    const message = "Error while user sign in";
    logger.error(message, { err, requestId });
    return res.status(500).json({
      status: false,
      message: message,
      data: null,
    });
  }
};

const signout = (req: UserRequest, res: Response) => {
  const { requestId } = req;
  try {
    return res.status(200).json({ status: true, message: "Logged out successfully.", data: null });
  } catch (err) {
    let message = "Error while signing out user user";
    if (err instanceof Error) {
      message += err.message;
    }
    logger.error(message, { err, requestId });
    return res.status(500).json({
      status: false,
      message,
      data: null,
    });
  }
};

const updatePassword = async (req: UserRequest, res: Response) => {
  const { body, requestId } = req;
  const user = req?.user;
  try {
    if (!user) {
      const message = "User not found";
      logger.debug(message, { user, requestId });
      return res.status(400).json({ status: false, message, data: null });
    }
    const { user_id } = user;
    const { old_password, new_password, cnf_password } = body;

    const updatePasswordValidator = validators.user.updatePasswordValidator.required().validate({
      old_password,
      new_password,
      cnf_password,
    });
    const updatePasswordErrorMessage = updatePasswordValidator?.error?.message;
    if (updatePasswordErrorMessage) {
      logger.debug(`Update Password validation failed`, { updatePasswordErrorMessage, body, user: user, requestId });
      return res.status(400).json({ status: false, message: updatePasswordErrorMessage, data: null });
    }

    const oldPasswordMatches = await bcrypt.compare(old_password, user.password);
    if (!oldPasswordMatches) {
      const message = "Invalid Password";
      return res.status(400).json({
        status: false,
        message: message,
        data: null,
      });
    }

    if (old_password == new_password) {
      const message = "Old Password cannot be New password";
      return res.status(400).json({
        status: false,
        message: message,
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const encPassword = await bcrypt.hash(new_password, salt);

    const { email } = user;

    await userService.updateUser({ user_id }, { password: encPassword });

    const { token: jwtToken, data: resData } = getJwtToken(user_id, email);

    return res.status(200).header("Access-Control-Expose-Headers", "token").setHeader("token", jwtToken).json({
      status: true,
      message: "Password Updated successfully",
      data: resData,
    });
  } catch (error) {
    const message = "Error while updating user password";
    logger.error(message, { error, user: user, body, requestId });
    return res.status(500).json({
      status: false,
      message,
      data: null,
    });
  }
};

const register = async (req: Request, res: Response) => {
  const { body, requestId } = req;
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

export default {
  signin,
  signout,
  updatePassword,
  register,
};
