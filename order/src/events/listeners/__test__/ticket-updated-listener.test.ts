import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket.model";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsService } from "../../../nats-service";
import { TicketUpdatedEvent } from "@db97tickets/common";
import { Message } from "node-nats-streaming";

const setup = async (versionJumps?: number) => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: "concert",
    price: 5.99,
  });
  await ticket.save();

  const listener = new TicketUpdatedListener(natsService.client);

  const data: TicketUpdatedEvent["data"] = {
    id: ticketId,
    title: "concert - updated",
    price: 6.99,
    version: ticket.version + (versionJumps || 1),
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("update an existing ticket after listen the - ticket:updated - event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
  expect(ticket?.version).toEqual(data.version);
  expect(msg.ack).toHaveBeenCalled();
});

it("doesnt update an existing ticket if the event version is not the following", async () => {
  const { listener, data, msg } = await setup(2);

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
