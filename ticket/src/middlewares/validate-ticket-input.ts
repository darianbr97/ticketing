import { validateRequest } from "@db97tickets/common";
import { body } from "express-validator";

export const validateTicketInput = validateRequest([
  body("title")
    .notEmpty()
    .withMessage("Title required")
    .bail()
    .isString()
    .withMessage("Title must be a string"),
  body("price")
    .notEmpty()
    .withMessage("Price required")
    .bail()
    .isFloat()
    .withMessage("Price must be a float number")
    .bail()
    .custom((value) => value > 0)
    .withMessage("Price must be greater than cero"),
]);
