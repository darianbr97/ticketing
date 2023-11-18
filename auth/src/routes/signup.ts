import { Request, Response, Router } from "express";
import { validateSignUpInputs } from "../middlewares/validate-signup-inputs";
import { User } from "../models/user.model";
import { BadRequestError } from "@db97tickets/common";
import { StatusCodes } from "http-status-codes";
import { attachJwtCookie } from "../lib/utils";

const router = Router();

router
  .route("/api/users/signup")
  .post(validateSignUpInputs, async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email });

    if (existUser) throw new BadRequestError("Email already exists");

    const newUser = await User.build({ email, password }).save();

    attachJwtCookie({
      req,
      payload: { id: newUser._id, email: newUser.email },
    });

    res.status(StatusCodes.CREATED).send(newUser);
  });

export { router as signUpRouter };
