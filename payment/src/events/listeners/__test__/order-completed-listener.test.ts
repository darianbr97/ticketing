import { OrderCompletedEvent, OrderStatus } from "@db97tickets/common";
import { natsService } from "../../../nats-service";
import { OrderCompletedListener } from "../order-completed-listener";
import { Order } from "../../../models/order.model";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCompletedListener(natsService.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10.99,
    status: OrderStatus.AwaitingPayment,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  const data: OrderCompletedEvent["data"] = {
    id: order.id,
    version: 1,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("update an order as complete", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const udpatedOrder = await Order.findById(data.id);

  expect(udpatedOrder?.status).toEqual(OrderStatus.Complete);
  expect(msg.ack).toHaveBeenCalled();
});
