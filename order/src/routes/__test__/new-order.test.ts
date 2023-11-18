import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order.model";
import { natsService } from "../../nats-service";

it("dont create an order without authentication", async () => {
  await request(app)
    .post("/api/orders")
    .send({ ticketId: new mongoose.Types.ObjectId().toString() })
    .expect(401);
});

it("dont create an order with invalid input", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", authenticate())
    .send({})
    .expect(400, {
      errors: [{ message: "Ticket id required", field: "ticketId" }],
    });

  await request(app)
    .post("/api/orders")
    .set("Cookie", authenticate())
    .send({ ticketId: "1234" })
    .expect(400, {
      errors: [{ message: "Invalid format of ticket id", field: "ticketId" }],
    });
});

it("return 404 if the ticket to be reserved doesnt exist", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", authenticate())
    .send({ ticketId: new mongoose.Types.ObjectId().toString() })
    .expect(404, { errors: [{ message: "Ticket not found" }] });
});

it("create successfully an order", async () => {
  const ticket = await createTicket();
  await createOrder(ticket._id).expect(201);

  const orderCreated = await Order.findOne({ ticket });

  expect(orderCreated).not.toBeNull();
});

it("return 400 if the ticket is already reserved", async () => {
  const ticket = await createTicket();
  await createOrder(ticket._id);

  await createOrder(ticket._id).expect(400, {
    errors: [{ message: "The ticket is already reserved" }],
  });
});

it("published an - order:created - event", async () => {
  const ticket = await createTicket();
  await createOrder(ticket._id);

  expect(natsService.client.publish).toHaveBeenCalled();
});
