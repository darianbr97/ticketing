import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from "@db97tickets/common";
import { natsService } from "../../../nats-service";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket.model";
import { Message } from "node-nats-streaming";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const createdListener = new OrderCreatedListener(natsService.client);
  const cancelledListener = new OrderCancelledListener(natsService.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const ticket = Ticket.build({
    title: "concert",
    price: 10.99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const createdEventData: OrderCreatedEvent["data"] = {
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

  await createdListener.onMessage(createdEventData, msg);

  const cancelledEventData: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket._id,
    },
    version: 1,
  };

  return { listener: cancelledListener, data: cancelledEventData, msg };
};

it("unmarked the ticket from his previous order", async () => {
  const { listener, data, msg } = await setup();

  const ticket = await Ticket.findById(data.ticket.id);
  expect(ticket?.orderId).toBeDefined();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.ticket.id);
  expect(updatedTicket?.orderId).toBeUndefined();
  expect(msg.ack).toHaveBeenCalled();
});

it("published the - ticket:updated - event after the ticket is cancelled", async () => {
  const { listener, data, msg } = await setup();

  const ticket = await Ticket.findById(data.ticket.id);
  expect(ticket?.orderId).toBeDefined();

  await listener.onMessage(data, msg);

  const ticketUpdateEventData: TicketUpdatedEvent["data"] = JSON.parse(
    (natsService.client.publish as jest.Mock).mock.calls[1][1]
  );

  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(natsService.client.publish).toHaveBeenCalled();
  expect(ticket?.version).toBeLessThan(ticketUpdateEventData.version);
  expect(updatedTicket?.version).toEqual(ticketUpdateEventData.version);
});
