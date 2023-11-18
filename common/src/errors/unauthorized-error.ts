import { ICustomError } from "../middlewares/error-handler";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class UnauthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor() {
    super("Unauthorize");

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeError(): ICustomError {
    return {
      statusCode: this.statusCode,
      errors: [{ message: "Unauthorize" }],
    };
  }
}
