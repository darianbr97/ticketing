import { Request, Response, Router } from "express";
import { extractUserInfo } from "@db97tickets/common";
import { StatusCodes } from "http-status-codes";

const router = Router();

router
  .route("/api/users/currentUser")
  .get(extractUserInfo, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).send({ currentUser: req.user });
  });

export { router as currentUserRouter };
