import { Router } from "express";
import { validateSignInInputs } from "../middlewares/validate-signin-inputs";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/user.model";
import { BadRequestError } from "@db97tickets/common";
import { attachJwtCookie } from "../lib/utils";

const router = Router();

router
  .route("/api/users/signin")
  .post(validateSignInInputs, async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.verifyPassword(password))) {
      throw new BadRequestError("Invalid credentials");
    }

    attachJwtCookie({ req, payload: { id: user._id, email: user.email } });

    res.status(StatusCodes.OK).send(user);
  });

export { router as signInRouter };
