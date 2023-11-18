import {
  OrderCreatedEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from "@db97tickets/common";
import { natsService } from "../../../nats-service";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket.model";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsService.client);

  const ticket = Ticket.build({
    title: "concert",
    price: 10.99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "123",
    status: OrderStatus.AwaitingPayment,
    userId: ticket.userId,
    version: 0,
    ticket: {
      id: ticket._id,
      price: ticket.price,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("marked the ticket with his order", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket?.orderId).toBeDefined();
  expect(updatedTicket?.orderId).toEqual(data.id);
  expect(msg.ack).toHaveBeenCalled();
});

it("published a - ticket:updated - event after link an order with the ticket", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticketUpdateEventData: TicketUpdatedEvent["data"] = JSON.parse(
    (natsService.client.publish as jest.Mock).mock.calls[0][1]
  );

  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket?.version).toEqual(ticketUpdateEventData.version);
  expect(updatedTicket?.orderId).toEqual(ticketUpdateEventData.orderId);
  expect(natsService.client.publish).toHaveBeenCalled();
});
