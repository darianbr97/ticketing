import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@db97tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { OrderCompletedPublisher } from "../publishers/order-completed-publisher";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    await new OrderCompletedPublisher(this.client).publish({
      id: order.id,
      version: order.version,
    });

    msg.ack();
  }
}
