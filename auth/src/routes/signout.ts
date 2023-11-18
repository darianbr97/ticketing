import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null;

  res.status(StatusCodes.OK).send("sign out");
});

export { router as signOutRouter };
