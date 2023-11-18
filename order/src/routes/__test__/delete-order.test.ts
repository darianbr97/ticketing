import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { natsService } from "../../nats-service";
import { Order, OrderStatus } from "../../models/order.model";

const ORDER_ID = new mongoose.Types.ObjectId().toString();

it("dont cancel an order without authentication", async () => {
  await request(app).delete(`/api/orders/${ORDER_ID}`).send({}).expect(401);
});

it("return 400 with an invalid id", async () => {
  await request(app)
    .delete(`/api/orders/1234`)
    .set("Cookie", authenticate())
    .send({})
    .expect(400, { errors: [{ message: "Invalid id format", field: "id" }] });
});

it("return 404 if the order doesnt exist", async () => {
  await request(app)
    .delete(`/api/orders/${ORDER_ID}`)
    .set("Cookie", authenticate())
    .send({})
    .expect(404, { errors: [{ message: "Order not found" }] });
});

it("dont cancel an order if it doesnt belong to the logged user", async () => {
  const user1 = new mongoose.Types.ObjectId().toString();
  const user2 = new mongoose.Types.ObjectId().toString();

  const ticket = await createTicket();
  const order = await createOrder(ticket._id, user1);

  await request(app)
    .delete(`/api/orders/${order.body.id}`)
    .set("Cookie", authenticate(user2))
    .send({})
    .expect(401);
});

it("doesnt cancel a paid order", async () => {
  const ticket = await createTicket();
  const order = Order.build({
    expiresAt: new Date(),
    status: OrderStatus.Complete,
    ticket,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", authenticate(order.userId))
    .send({})
    .expect(400, { errors: [{ message: "Cannot cancel a paid order" }] });
});

it("cancelled successfully an order", async () => {
  const ticket = await createTicket();
  const order = await createOrder(ticket._id);

  await request(app)
    .delete(`/api/orders/${order.body.id}`)
    .set("Cookie", authenticate())
    .send({})
    .expect(200, {
      ...order.body,
      version: 1,
      status: "cancelled",
    });
});

it("published an - order:cancelled - event", async () => {
  const ticket = await createTicket();
  const order = await createOrder(ticket._id);

  await request(app)
    .delete(`/api/orders/${order.body._id}`)
    .set("Cookie", authenticate())
    .send({});

  expect(natsService.client.publish).toHaveBeenCalled();
});
