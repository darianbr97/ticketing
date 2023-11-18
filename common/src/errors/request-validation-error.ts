import { ValidationError } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { ICustomError } from "../middlewares/error-handler";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(private errors: ValidationError[]) {
    super("Invalid request parameters");

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeError() {
    const formatedError: ICustomError = {
      statusCode: this.statusCode,
      errors: [],
    };

    this.errors.forEach((error) => {
      if (error.type === "field")
        formatedError.errors.push({ message: error.msg, field: error.path });
    });

    return formatedError;
  }
}
