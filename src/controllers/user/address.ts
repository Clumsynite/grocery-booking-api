import { Response } from "express";

import logger from "../../utils/logger";
import { UserRequest } from "../../@types/Express";

import { Address } from "../../@types/database";
import { count } from "../../@types/Knex";

import * as addressService from "../../db_services/address";
import validators from "../../validators";

const createAddress = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, body } = req;
  try {
    const { customer_name, phone_number, address_nickname, address_line, city, state, pincode, instructions } = body;
    const bodyValidation = validators.address.newAddress.validate({
      user_id,
      customer_name,
      phone_number,
      address_nickname,
      address_line,
      city,
      state,
      pincode,
      instructions,
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const addressExists = await addressService.getAddressByFilter({ address_nickname });
    if (addressExists) {
      return res.status(400).json({
        status: false,
        message: "Address with a similar nickname already exists",
        data: null,
      });
    }

    const address = await addressService.createAddress({
      customer_name,
      phone_number,
      address_nickname,
      address_line,
      city,
      state,
      pincode,
      instructions,
      user_id,
      is_deleted: false,
    });

    return res.status(200).json({ status: true, message: "Address Created Successfully", data: { address } });
  } catch (err) {
    const message = "Error while creating address";
    logger.error(message, { err, user_id, requestId, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const updateAddress = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, body, params } = req;
  const { address_id } = params;

  try {
    const { customer_name, phone_number, address_nickname, address_line, city, state, pincode, instructions } = body;
    const bodyValidation = validators.address.oldAddress.validate({
      address_id,
      user_id,
      customer_name,
      phone_number,
      address_nickname,
      address_line,
      city,
      state,
      pincode,
      instructions,
    });
    if (bodyValidation.error) {
      return res.status(400).json({
        status: false,
        message: bodyValidation.error.message,
        data: null,
      });
    }

    const addressData = await addressService.getAddressById(address_id);
    if (!addressData) {
      return res.status(400).json({
        status: false,
        message: "Address not found",
        data: null,
      });
    }

    const addressExists = await addressService.getAddressByFilter({ address_nickname });
    if (addressExists && addressExists.address_id !== address_id) {
      return res.status(400).json({
        status: false,
        message: "Address with a similar nickname already exists",
        data: null,
      });
    }

    const updateObj = {
      customer_name,
      phone_number,
      address_nickname,
      address_line,
      city,
      state,
      pincode,
      instructions,
    };
    const address = await addressService.updateAddress({ address_id }, updateObj);

    return res.status(200).json({ status: true, message: "Address Updated Successfully", data: { address } });
  } catch (err) {
    const message = "Error while updated address";
    logger.error(message, { err, user_id, requestId, body, address_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getAddress = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params } = req;
  const { address_id } = params;
  try {
    const idValidator = validators.common.uuid.required().validate(address_id);
    if (idValidator.error) {
      return res.status(400).json({
        status: false,
        message: "Address ID is invalid",
        data: null,
      });
    }

    const addressData = await addressService.getAddressById(address_id);
    if (!addressData) {
      return res.status(400).json({
        status: false,
        message: "Address not found",
        data: null,
      });
    }
    return res.status(200).json({ status: true, message: "Address Found", data: addressData });
  } catch (err) {
    const message = "Error while Fetching Address";
    logger.error(message, { err, user_id, requestId, address_id });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const getAddresses = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, query } = req;
  try {
    const { limit: qLimit, skip: qSkip, user_id: qCategoryId } = query;
    const limit = Number(qLimit || 0) || 0;
    const skip = Number(qSkip || 0) || 0;
    const user_id = String(qCategoryId || "");

    const addresses = (await addressService.getAllAddresses({ limit, skip, user_id })) as Partial<Address>[];
    let count = 0;

    if (addresses?.length) {
      const allAddressesCount = (await addressService.getAllAddresses({
        limit: null,
        skip: null,
        totalRecords: true,
        user_id,
      })) as count;
      count = Number(allAddressesCount?.count);
    }

    return res
      .header("Access-Control-Expose-Headers", "x-total-count")
      .setHeader("x-total-count", count)
      .status(200)
      .json({
        status: true,
        message: "Addresses Fetched Successfully",
        data: addresses,
      });
  } catch (err) {
    const message = "Error while fetching all addresses";
    logger.error(message, { err, user_id, requestId });
    return res.status(500).json({ status: false, message, data: null });
  }
};

const deleteAddress = async (req: UserRequest, res: Response) => {
  const { user_id, requestId, params, body } = req;

  try {
    const { address_id } = params;
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
        message: "Address ID is invalid",
        data: null,
      });
    }

    const addressData = await addressService.getAddressByFilter({ address_id });
    if (!address_id) {
      return res.status(400).json({
        status: false,
        message: "Address not found",
        data: null,
      });
    }

    if (addressData?.is_deleted === is_deleted) {
      return res.status(200).json({ status: true, message: `Address was already ${operation}`, data: null });
    }

    await addressService.updateAddress({ address_id }, { is_deleted });

    return res.status(200).json({ status: true, message: `Address ${operation} successfully`, data: null });
  } catch (err) {
    const message = "Error while deleting address";
    logger.error(message, { err, user_id, requestId, params, body });
    return res.status(500).json({ status: false, message, data: null });
  }
};

export default {
  createAddress,
  updateAddress,
  getAddress,
  getAddresses,
  deleteAddress,
};
