import { ICustomError } from "../middlewares/error-handler";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor(message = "") {
    super(message || "Route not found");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeError(): ICustomError {
    return {
      statusCode: this.statusCode,
      errors: [{ message: this.message || "Route Not found" }],
    };
  }
}
