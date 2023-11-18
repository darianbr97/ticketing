import { Router, Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  UnauthorizedError,
  extractUserInfo,
  validateAuth,
  validateIdParam,
} from "@db97tickets/common";
import { StatusCodes } from "http-status-codes";
import { Order } from "../models/order.model";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsService } from "../nats-service";

const router = Router();

router
  .route("/api/orders/:id")
  .delete(
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

      if (order.status === OrderStatus.Complete) {
        throw new BadRequestError("Cannot cancel a paid order");
      }

      if (order.status !== OrderStatus.Cancelled) {
        order.status = OrderStatus.Cancelled;
        await order.save();

        new OrderCancelledPublisher(natsService.client).publish({
          id: order._id,
          ticket: { id: order.ticket._id },
          version: order.version,
        });
      }

      res.status(StatusCodes.OK).send(order);
    }
  );

export { router as DeleteOrderRouter };
