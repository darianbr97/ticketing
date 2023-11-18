import { Request, Response, Router } from "express";
import {
  extractUserInfo,
  validateAuth,
  NotFoundError,
  UnauthorizedError,
  OrderStatus,
  BadRequestError,
} from "@db97tickets/common";
import { validateCreateChargeInput } from "../middlewares/validate-createCharge-input";
import { Order } from "../models/order.model";
import { StatusCodes } from "http-status-codes";
import { stripe } from "../stripe";
import { Payment } from "../models/payment.model";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsService } from "../nats-service";

const router = Router();

router
  .route("/api/payments")
  .post(
    [extractUserInfo, validateAuth, validateCreateChargeInput],
    async (req: Request, res: Response) => {
      const { token, orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError("Order not found");
      }

      const userOwnOrder = order.userId === req.user!.id;
      if (!userOwnOrder) {
        throw new UnauthorizedError();
      }

      if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError("Cannot charge an cancelled order");
      }

      if (order.status === OrderStatus.Complete) {
        throw new BadRequestError("This order was already charged");
      }

      const charge = await stripe.charges.create({
        currency: "usd",
        amount: order.price * 100,
        source: token,
      });

      const payment = Payment.build({
        orderId: order.id,
        stripeId: charge.id,
      });
      await payment.save();

      new PaymentCreatedPublisher(natsService.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
      });

      res.status(StatusCodes.CREATED).send({ id: payment.id });
    }
  );

export { router as CreatePaymentRouter };
