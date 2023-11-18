import mongoose from "mongoose";
import { natsService } from "../../../nats-service";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@db97tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order.model";

const setup = async () => {
  const listener = new OrderCreatedListener(natsService.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.AwaitingPayment,
    expiresAt: "1231",
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10.99,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("created an order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const orderCreated = await Order.findById(data.id);

  expect(orderCreated?.id).toEqual(data.id);
  expect(msg.ack).toHaveBeenCalled();
});
