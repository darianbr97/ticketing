import { OrderStatus, PaymentCreatedEvent } from "@db97tickets/common";
import { natsService } from "../../../nats-service";
import { PaymentCreatedListener } from "../payment-created-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order.model";
import { Ticket } from "../../../models/ticket.model";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new PaymentCreatedListener(natsService.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10.99,
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.AwaitingPayment,
    ticket,
    expiresAt: new Date(),
  });
  await order.save();

  const data: PaymentCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: "alsdkjkj2l32lj2l3kj",
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("marked an order as complete", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const udpatedOrder = await Order.findById(data.orderId);

  expect(udpatedOrder?.status).toEqual(OrderStatus.Complete);
});
