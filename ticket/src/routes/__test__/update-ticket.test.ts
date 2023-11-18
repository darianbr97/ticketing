import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { natsService } from "../../nats-service";
import { Ticket } from "../../models/ticket.model";

it("dont update a ticket without authentication", async () => {
  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .send({
      title: "shoes - edited",
      price: "10.99",
    })
    .expect(401);
});

it("return 400 with an invalid id", async () => {
  const jwtCookie = authenticate();

  await request(app)
    .put("/api/tickets/1231231")
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
      price: "10.99",
    })
    .expect(400, { errors: [{ message: "Invalid id format", field: "id" }] });
});

it("dont update a ticket without provide a title or price", async () => {
  const jwtCookie = authenticate();

  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .set("Cookie", jwtCookie)
    .send({
      price: "10.99",
    })
    .expect(400, { errors: [{ message: "Title required", field: "title" }] });

  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
    })
    .expect(400, { errors: [{ message: "Price required", field: "price" }] });
});

it("dont update a ticket with invalid atributes", async () => {
  const jwtCookie = authenticate();

  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .set("Cookie", jwtCookie)
    .send({
      title: 12,
      price: "10.99",
    })
    .expect(400, {
      errors: [{ message: "Title must be a string", field: "title" }],
    });

  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
      price: "1asd.23",
    })
    .expect(400, {
      errors: [{ message: "Price must be a float number", field: "price" }],
    });

  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
      price: "-10.23",
    })
    .expect(400, {
      errors: [{ message: "Price must be greater than cero", field: "price" }],
    });
});

it("return 404 if the ticket doesnt exist", async () => {
  const jwtCookie = authenticate();

  await request(app)
    .put("/api/tickets/654bdc60b15103f79a7508da")
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
      price: "10.99",
    })
    .expect(404, { errors: [{ message: "Ticket not found" }] });
});

it("dont udpate a ticket if the user isnt the owner", async () => {
  const user1_id = new mongoose.Types.ObjectId().toHexString();
  const jwtCookie1 = authenticate(user1_id);

  const ticket = await createTicket(jwtCookie1);

  const user2_id = new mongoose.Types.ObjectId().toHexString();
  const jwtCookie2 = authenticate(user2_id);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set("Cookie", jwtCookie2)
    .send({
      title: "shoes - edited",
      price: "5.99",
    })
    .expect(401, { errors: [{ message: "Unauthorize" }] });
});

it("doesnt update a reserved ticket", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 10.0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  await request(app)
    .put(`/api/tickets/${ticket._id}`)
    .set("Cookie", authenticate(ticket.userId))
    .send({
      title: "concert - updated",
      price: 11.33,
    })
    .expect(400, { errors: [{ message: "Cannot edit a reserved ticket" }] });
});

it("update successfully a ticket", async () => {
  const jwtCookie = authenticate();
  const newTicket = await createTicket(jwtCookie);

  await request(app)
    .put(`/api/tickets/${newTicket.body.id}`)
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
      price: "5.99",
    })
    .expect(200, {
      id: newTicket.body.id,
      title: "shoes - edited",
      price: 5.99,
      version: 1,
      userId: newTicket.body.userId,
    });
});

it("published a - ticket:updated - event", async () => {
  const jwtCookie = authenticate();
  const newTicket = await createTicket(jwtCookie);

  await request(app)
    .put(`/api/tickets/${newTicket.body.id}`)
    .set("Cookie", jwtCookie)
    .send({
      title: "shoes - edited",
      price: "5.99",
    });

  expect(natsService.client.publish).toHaveBeenCalled();
});
