import { validateRequest } from "./validate-request";
import { param } from "express-validator";
import mongoose from "mongoose";

export const validateIdParam = validateRequest([
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid id format"),
]);
