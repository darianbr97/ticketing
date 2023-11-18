import request from "supertest";
import app from "../../app";
import { Ticket } from "../../models/ticket.model";
import { natsService } from "../../nats-service";

it("dont create a new ticket without authentication", async () => {
  // const jwtCookie = await authenticate()
  await request(app)
    .post("/api/tickets")
    .send({ title: "shoes", price: "10.99" })
    .expect(401);
});

it("dont create a new ticket without title or price atributes", async () => {
  const jwtCookie = authenticate();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", jwtCookie)
    .send({ price: "10.99" })
    .expect(400, {
      errors: [{ message: "Title required", field: "title" }],
    });

  await request(app)
    .post("/api/tickets")
    .set("Cookie", jwtCookie)
    .send({ title: "shoes" })
    .expect(400, {
      errors: [{ message: "Price required", field: "price" }],
    });
});

it("dont create a new ticket with invalid atributes", async () => {
  const jwtCookie = authenticate();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", jwtCookie)
    .send({ title: 12, price: "10.99" })
    .expect(400, {
      errors: [{ message: "Title must be a string", field: "title" }],
    });

  await request(app)
    .post("/api/tickets")
    .set("Cookie", jwtCookie)
    .send({ title: "shoes", price: "1as0.99" })
    .expect(400, {
      errors: [{ message: "Price must be a float number", field: "price" }],
    });

  await request(app)
    .post("/api/tickets")
    .set("Cookie", jwtCookie)
    .send({ title: "shoes", price: "-10.99" })
    .expect(400, {
      errors: [{ message: "Price must be greater than cero", field: "price" }],
    });
});

it("create a new ticket successfully", async () => {
  const jwtCookie = authenticate();
  let tickets = await Ticket.countDocuments();
  expect(tickets).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", jwtCookie)
    .send({ title: "shoes", price: "10.99" })
    .expect(201);

  tickets = await Ticket.countDocuments();

  expect(tickets).toEqual(1);
});

it("published an - ticket:created - event", async () => {
  await createTicket();

  expect(natsService.client.publish).toHaveBeenCalled();
});
