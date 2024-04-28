import { v4 as uuidv4 } from "uuid";
import { NextFunction, Response } from "express";
import { Request } from "../@types/Express";

const assignId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  next();
};

export default assignId;
