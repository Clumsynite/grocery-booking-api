import { Request } from "express";

const getRandomNumber = (length: number = 6): string =>
  length > 0
    ? String(
        Math.floor(Math.random() * Number(`${9}${"0".repeat(length - 1)}`)) + Number(`${1}${"0".repeat(length - 1)}`)
      )
    : "";

const getIp = (req: Request) => {
  if (!req) throw new Error("Request data is required to get IP");
  const ip = req?.body?.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  return ip;
};

const getRandomMobileNumber = () => {
  let str =
    "9" +
    Math.floor(Math.random() * 1000000000)
      .toString()
      .toString();
  while (str.length < 10) {
    str = "9" + str;
  }
  return str.toString();
};

const trimErrorMessage = (msg: string, maxLength: number = 200) => {
  if (!msg) return msg;
  if (msg.length <= maxLength) {
    return msg;
  } else {
    const trimmedMessage = msg.substring(0, maxLength);
    return trimmedMessage;
  }
};

export default {
  getRandomNumber,
  getIp,
  getRandomMobileNumber,
  trimErrorMessage,
};
