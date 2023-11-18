import { Router, Request, Response } from "express";
import {
  NotFoundError,
  UnauthorizedError,
  extractUserInfo,
  validateAuth,
  validateIdParam,
} from "@db97tickets/common";
import { StatusCodes } from "http-status-codes";
import { Order } from "../models/order.model";

const router = Router();

router
  .route("/api/orders/:id")
  .get(
    [extractUserInfo, validateAuth, validateIdParam],
    async (req: Request, res: Response) => {
      const { id: orderId } = req.params;

      const order = await Order.findById(orderId).populate("ticket");
      if (!order) {
        throw new NotFoundError("Order not found");
      }

      if (order.userId !== req.user!.id) {
        throw new UnauthorizedError();
      }

      res.status(StatusCodes.OK).send(order);
    }
  );

export { router as GetSingleOrderRouter };
