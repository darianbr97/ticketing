import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error";

export const validateAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req?.user) throw new UnauthorizedError();
  next();
};
