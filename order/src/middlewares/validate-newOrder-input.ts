import { validateRequest } from "@db97tickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";

export const validateNewOrderInput = validateRequest([
  body("ticketId")
    .trim()
    .notEmpty()
    .withMessage("Ticket id required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid format of ticket id"),
]);
