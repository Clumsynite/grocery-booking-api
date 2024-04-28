import { Request, Response } from "express";
import config from "../config";

const getHealth = (req: Request, res: Response) => {
  const data = {
    uptime: process.uptime(),
    message: "Ok",
    date: new Date(),
    app: config.APP_NAME,
  };
  res.status(200).send(data);
};

export default { getHealth };
