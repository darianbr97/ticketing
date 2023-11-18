import { validateRequest } from "@db97tickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";

export const validateCreateChargeInput = validateRequest([
  body("token").trim().notEmpty().withMessage("Token required"),
  body("orderId")
    .trim()
    .notEmpty()
    .withMessage("Order id required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid orderId format"),
]);
