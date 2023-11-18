import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/custom-error";

export interface ICustomError {
  statusCode: number;
  errors: {
    message: string;
    field?: string;
  }[];
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError: ICustomError = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    errors: [{ message: "Something went wrong" }],
  };

  if (err instanceof CustomError) {
    customError = err.serializeError();
  } else {
    console.error(err);
  }

  res.status(customError.statusCode).send({ errors: customError.errors });
};
