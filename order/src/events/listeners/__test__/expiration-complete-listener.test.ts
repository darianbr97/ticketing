import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket.model";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsService } from "../../../nats-service";
import { Order, OrderStatus } from "../../../models/order.model";
import { ExpirationCompleteEvent } from "@db97tickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsService.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10.99,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.AwaitingPayment,
    expiresAt: new Date(),
    ticket,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("cancelled the order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.orderId);

  expect(updatedOrder?.status).toEqual("cancelled");
  expect(msg.ack).toHaveBeenCalled();
});

it("published an - order:cancelled - event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const orderCancelledEvent = (natsService.client.publish as jest.Mock).mock
    .calls[0];

  expect(natsService.client.publish).toHaveBeenCalled();
  expect(orderCancelledEvent[0]).toEqual("order:cancelled");
});
