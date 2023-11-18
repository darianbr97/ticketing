import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order.model";
import { OrderStatus } from "@db97tickets/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment.model";

it("doesnt creates a charge without authentication", async () => {
  await request(app)
    .post("/api/payments")
    .send({
      token: "1lk2j3lk41kl231l2k31l3k",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(401);
});

it("doesnt creates a charge with invalid inputs", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(400, { errors: [{ message: "Token required", field: "token" }] });

  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate())
    .send({
      token: "1lk2j3lk41kl231l2k31l3k",
      orderId: "123132",
    })
    .expect(400, {
      errors: [{ message: "Invalid orderId format", field: "orderId" }],
    });

  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate())
    .send({
      token: "1lk2j3lk41kl231l2k31l3k",
    })
    .expect(400, {
      errors: [{ message: "Order id required", field: "orderId" }],
    });
});

it("returns 404 if the order doesnt exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate())
    .send({
      token: "1lk2j3lk41kl231l2k31l3k",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404, { errors: [{ message: "Order not found" }] });
});

it("returns 401 if the logged user dont own the order", async () => {
  const userOne = new mongoose.Types.ObjectId().toHexString();
  const userTwo = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userOne,
    status: OrderStatus.AwaitingPayment,
    price: 10.99,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate(userTwo))
    .send({
      token: "1lk2j3lk41kl231l2k31l3k",
      orderId: order.id,
    })
    .expect(401);
});

it("doesnt creates a charge if the order is cancelled", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    price: 10.99,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate(order.userId))
    .send({
      token: "1lk2j3lk41kl231l2k31l3k",
      orderId: order.id,
    })
    .expect(400, { errors: [{ message: "Cannot charge an cancelled order" }] });
});

it("creates a charge", async () => {
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.AwaitingPayment,
    price,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate(order.userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
});

it("records a payment after successfull charge", async () => {
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.AwaitingPayment,
    price,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authenticate(order.userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const charges = await stripe.charges.list({ limit: 50 });
  const currentCharge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(currentCharge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: currentCharge?.id,
  });

  expect(payment).not.toBeNull();
});
