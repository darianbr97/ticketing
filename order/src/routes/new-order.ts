import { Router, Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  extractUserInfo,
  validateAuth,
} from "@db97tickets/common";
import { StatusCodes } from "http-status-codes";
import { validateNewOrderInput } from "../middlewares/validate-newOrder-input";
import { Ticket } from "../models/ticket.model";
import { Order } from "../models/order.model";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsService } from "../nats-service";

const router = Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router
  .route("/api/orders")
  .post(
    [extractUserInfo, validateAuth, validateNewOrderInput],
    async (req: Request, res: Response) => {
      const { ticketId } = req.body;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new NotFoundError("Ticket not found");
      }

      const ticketAlreadyReserved = await ticket.isReserved();
      if (ticketAlreadyReserved) {
        throw new BadRequestError("The ticket is already reserved");
      }

      const orderExpiration = new Date();
      orderExpiration.setSeconds(
        orderExpiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
      );

      const newOrder = Order.build({
        userId: req.user!.id,
        status: OrderStatus.AwaitingPayment,
        expiresAt: orderExpiration,
        ticket,
      });
      await newOrder.save();

      new OrderCreatedPublisher(natsService.client).publish({
        id: newOrder._id,
        status: newOrder.status,
        expiresAt: newOrder.expiresAt.toISOString(),
        userId: newOrder.userId,
        ticket: {
          id: newOrder.ticket._id,
          price: newOrder.ticket.price,
        },
        version: newOrder.version,
      });

      res.status(StatusCodes.CREATED).send(newOrder);
    }
  );

export { router as CreateOrderRouter };
