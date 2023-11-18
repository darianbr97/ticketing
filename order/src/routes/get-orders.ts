import { Router, Request, Response } from "express";
import { extractUserInfo, validateAuth } from "@db97tickets/common";
import { StatusCodes } from "http-status-codes";
import { Order } from "../models/order.model";

const router = Router();

router
  .route("/api/orders")
  .get([extractUserInfo, validateAuth], async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.user!.id }).populate(
      "ticket"
    );
    res.status(StatusCodes.OK).send(orders);
  });

export { router as GetOrdersRouter };
