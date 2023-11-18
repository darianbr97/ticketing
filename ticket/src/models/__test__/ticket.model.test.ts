import mongoose from "mongoose";
import { Ticket } from "../ticket.model";

it("decline an unsequence version of update on Tickets db", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: new mongoose.Types.ObjectId().toString(),
  });

  await ticket.save();

  const ticket_copy1 = await Ticket.findById(ticket._id);
  const ticket_copy2 = await Ticket.findById(ticket._id);

  ticket_copy1!.title = "concert - cp1";
  ticket_copy2!.title = "concert - cp2";

  await ticket_copy1?.save();

  try {
    await ticket_copy2?.save();
  } catch (error) {
    return;
  }

  throw new Error("Test failed. It cannot reach at this point");
});

it("increment ticket versioning after update", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: new mongoose.Types.ObjectId().toString(),
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
