import { Response } from "express";
import bcrypt from "bcrypt";

import logger from "../../utils/logger";
import { AdminRequest } from "../../@types/Express";

import * as adminService from "../../db_services/admin";
import { Admin } from "../../@types/database";
import { count } from "../../@types/Knex";
import validators from "../../validators";

const createAdmin = async (req: AdminRequest, res: Response) => {
  const { body, requestId, admin_id: created_by } = req;
  try {
    const { username, password, email, cnf_password } = body;

    const validator = validators.admin.newUserValidator.validate({
      username,
      password,
      email,
      cnf_password,
    });
    if (validator.error) {
      const message = validator.error.message;
      logger.debug("Validation error while creating admin user", { body, message, requestId });
      return res.status(400).json({
        status: false,
        message,
        data: null,
      });
    }

    const usernameExists = await adminService.getAdminByFilter({ username });
    if (usernameExists) {
      return res.status(400).json({
        status: false,
        message: "Username already exists!",
        data: null,
      });
    }

    const emailExists = await adminService.getAdminByFilter({ email });
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
      username: username.toLowerCase(),
      password: encPassword,
      email: email.toLowerCase(),
      created_by,
      updated_by: created_by,
    };

    const admin = await adminService.createAdmin(newUserObj);

    return res.status(201).json({
      status: true,
      message: "User created successfully.",
      data: { ...admin, password: "" },
    });
  } catch (err) {
    const message = "Error while creating admin user";
    logger.error(message, { err, requestId });
    return res.status(500).json({
      status: false,
      message: message,
      data: null,
    });
  }
};

const getAdminUsers = async (req: AdminRequest, res: Response) => {
  const { admin_id, requestId, query } = req;
  try {
    const { limit: qLimit, skip: qSkip } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;

    const admins = (await adminService.getAllAdmins({ limit, skip })) as Partial<Admin>[];
    let count = 0;

    if (admins?.length) {
      const allRolesCount = (await adminService.getAllAdmins({
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
        data: admins,
      });
  } catch (err) {
    const message = "Error while fetching all admin admins";
    logger.error(message, { err, admin_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getAdminById = async (req: AdminRequest, res: Response) => {
  const { requestId, params } = req;
  const { admin_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(admin_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "Admin User ID is invalid",
        data: null,
      });
    }

    const adminData = await adminService.getAdminById(admin_id);
    if (!adminData) {
      return res.status(400).json({
        status: false,
        message: "Admin User not found",
        data: null,
      });
    }
    return res.status(200).json({ status: true, message: "Admin User Found", data: { user: adminData } });
  } catch (err) {
    const message = "Error while Fetching Admin Users";
    logger.error(message, { err, requestId, admin_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const updateAdmin = async (req: AdminRequest, res: Response) => {
  const { admin_id: updated_by, requestId, body, params } = req;
  const { admin_id } = params;

  try {
    const { email, username }: { email: string; username: string } = body;

    const bodyValidation = validators.admin.updateUserValidation.validate({
      email,
      admin_id,
      username,
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const userData = await adminService.getAdminById(admin_id);
    if (!userData) {
      return res.status(400).json({
        status: false,
        message: "Admin User not found",
        data: null,
      });
    }

    const usernameExists = await adminService.getAdminByFilter({ username: username.toLowerCase() });
    if (usernameExists && usernameExists.admin_id !== admin_id) {
      return res.status(400).json({
        status: false,
        message: "Username already exists",
        data: null,
      });
    }

    const emailExists = await adminService.getAdminByFilter({ email: email.toLowerCase() });
    if (emailExists && emailExists.admin_id !== admin_id) {
      return res.status(400).json({
        status: false,
        message: "Email already exists",
        data: null,
      });
    }

    const updateObj = {
      email,
      username,
      updated_by,
      is_deleted: userData?.is_deleted,
    };

    const userObj = await adminService.updateAdmin({ admin_id }, updateObj);

    return res.status(200).json({ status: true, message: "Admin User Updated Successfully", data: { user: userObj } });
  } catch (err) {
    const message = "Error while updated admin user";
    logger.error(message, { err, updated_by, requestId, body, admin_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const deleteAdmin = async (req: AdminRequest, res: Response) => {
  const { admin_id: updated_by, requestId, params, body } = req;
  const { admin_id } = params;

  try {
    const { is_deleted }: { is_deleted: boolean } = body;
    const operation = is_deleted ? "disabled" : "enabled";
    const validator = validators.common.isDeleted.required().validate({ id: admin_id, is_deleted });
    if (validator.error) {
      return res.status(400).json({
        status: false,
        message: "Admin User ID is invalid",
        data: null,
      });
    }

    if (updated_by === admin_id) {
      return res.status(400).json({
        status: false,
        message: "Cannot switch self status",
        data: null,
      });
    }

    const userData = await adminService.getAdminByFilter({ admin_id });
    if (!userData) {
      return res.status(400).json({
        status: false,
        message: "Admin User not found",
        data: null,
      });
    }

    if (userData?.is_deleted === is_deleted) {
      return res.status(200).json({ status: true, message: `Admin User was already ${operation}`, data: null });
    }

    await adminService.updateAdmin({ admin_id }, { is_deleted, updated_by });

    return res.status(200).json({ status: true, message: `Admin User ${operation} successfully`, data: null });
  } catch (err) {
    const message = "Error while deleting admin user";
    logger.error(message, { err, updated_by, admin_id, requestId, params, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  createAdmin,
  getAdminUsers,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
