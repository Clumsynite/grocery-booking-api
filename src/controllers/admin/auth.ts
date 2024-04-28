import { Response } from "express";
import bcrypt from "bcrypt";
import moment from "moment";

import { AdminRequest } from "../../@types/Express";

import validators from "../../validators";

import logger from "../../utils/logger";

import * as adminService from "../../db_services/admin";

import helpers from "../../helpers/helper";
import { getAdminJwtToken as getJwtToken } from "../../helpers/login";

const signin = async (req: AdminRequest, res: Response) => {
  const { body, requestId } = req;
  const ip = helpers.getIp(req);
  try {
    const { email, password } = body;
    const validator = validators.admin.loginValidator.validate({ email, password });
    if (validator.error) {
      const message = validator.error.message;
      logger.debug("Validation error while admin signin", { body, message, requestId });
      return res.status(400).json({
        status: false,
        message,
        data: null,
      });
    }

    const adminExists = await adminService.getAdminByFilter({ email, is_deleted: false });
    if (!adminExists) {
      const message = "email or password is Invalid";
      logger.debug(message, { email, requestId });
      return res.status(400).json({
        status: false,
        message,
        data: null,
      });
    }

    const { username, admin_id } = adminExists;
    const isPasswordValid = await bcrypt.compare(password, adminExists.password);
    if (!isPasswordValid) {
      const message = "Email or password is Invalid";
      logger.debug(message, { email, requestId });
      return res.status(400).json({
        status: false,
        message: message,
        data: null,
      });
    }

    const { token: jwtToken, data } = getJwtToken(admin_id, email, username);

    await adminService.updateAdmin({ admin_id }, { last_login_ip: ip, last_login_timestamp: moment().toISOString() });

    return res.status(200).header("Access-Control-Expose-Headers", "token").setHeader("token", jwtToken).json({
      status: true,
      message: "Successfully Signed in!",
      data,
    });
  } catch (err) {
    const message = "Error while admin sign in";
    logger.error(message, { err, requestId });
    return res.status(500).json({
      status: false,
      message: message,
      data: null,
    });
  }
};

const signout = (req: AdminRequest, res: Response) => {
  const { requestId } = req;
  try {
    return res.status(200).json({ status: true, message: "Logged out successfully.", data: null });
  } catch (err) {
    let message = "Error while signing out admin user";
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

const updatePassword = async (req: AdminRequest, res: Response) => {
  const { body, requestId } = req;
  const admin = req?.admin;
  try {
    if (!admin) {
      const message = "Admin not found";
      logger.debug(message, { admin, requestId });
      return res.status(400).json({ status: false, message, data: null });
    }
    const { admin_id } = admin;
    const { old_password, new_password, cnf_password } = body;

    const updatePasswordValidator = validators.admin.updatePasswordValidator.required().validate({
      old_password,
      new_password,
      cnf_password,
    });
    const updatePasswordErrorMessage = updatePasswordValidator?.error?.message;
    if (updatePasswordErrorMessage) {
      logger.debug(`Update Password validation failed`, { updatePasswordErrorMessage, body, user: admin, requestId });
      return res.status(400).json({ status: false, message: updatePasswordErrorMessage, data: null });
    }

    const oldPasswordMatches = await bcrypt.compare(old_password, admin.password);
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

    const { username, email } = admin;

    await adminService.updateAdmin({ admin_id }, { password: encPassword, updated_by: admin_id });

    const { token: jwtToken, data: resData } = getJwtToken(admin_id, email, username);

    return res.status(200).header("Access-Control-Expose-Headers", "token").setHeader("token", jwtToken).json({
      status: true,
      message: "Password Updated successfully",
      data: resData,
    });
  } catch (error) {
    const message = "Error while updating admin password";
    logger.error(message, { error, user: admin, body, requestId });
    return res.status(500).json({
      status: false,
      message,
      data: null,
    });
  }
};

export default {
  signin,
  signout,
  updatePassword,
};
