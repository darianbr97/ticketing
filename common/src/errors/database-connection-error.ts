import { StatusCodes } from "http-status-codes";
import { ICustomError } from "../middlewares/error-handler";
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  reason = "Error connecting to database";

  constructor() {
    super("Error connecting to db");

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeError(): ICustomError {
    return {
      statusCode: this.statusCode,
      errors: [{ message: this.reason }],
    };
  }
}
