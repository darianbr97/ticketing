import { ICustomError } from "../middlewares/error-handler";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeError(): ICustomError {
    return {
      statusCode: this.statusCode,
      errors: [{ message: this.message }],
    };
  }
}
