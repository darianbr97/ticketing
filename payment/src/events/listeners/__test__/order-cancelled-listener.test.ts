import mongoose from "mongoose";
import { natsService } from "../../../nats-service";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@db97tickets/common";
import { Order } from "../../../models/order.model";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsService.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10.99,
    status: OrderStatus.AwaitingPayment,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: { id: new mongoose.Types.ObjectId().toHexString() },
    version: 1,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("cancelled an order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const udpatedOrder = await Order.findById(data.id);

  expect(udpatedOrder?.status).toEqual("cancelled");
  expect(msg.ack).toHaveBeenCalled();
});
