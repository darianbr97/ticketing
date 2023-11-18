import { body } from "express-validator";
import { validateRequest } from "@db97tickets/common";

export const validateSignInInputs = validateRequest([
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").trim().notEmpty().withMessage("Password is required"),
]);
