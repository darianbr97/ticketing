import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";

it("dont get an order without authentication", async () => {
  await request(app).get("/api/orders").send({}).expect(401);
});

it("get only orders from logged user", async () => {
  const testUser = new mongoose.Types.ObjectId().toString();

  const ticket1 = await createTicket();
  const ticket2 = await createTicket();
  const ticket3 = await createTicket();

  const order1 = await createOrder(ticket1._id, testUser);
  await createOrder(ticket2._id);
  await createOrder(ticket3._id);

  await request(app)
    .get("/api/orders")
    .set("Cookie", authenticate(testUser))
    .send({})
    .expect(200, [order1.body]);
});
