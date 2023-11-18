import request from "supertest";
import app from "../../app";

it("anyone can get a ticket", async () => {
  const newTicket = await createTicket();

  await request(app)
    .get(`/api/tickets/${newTicket.body.id}`)
    .send({})
    .expect(200, {
      id: newTicket.body.id,
      title: newTicket.body.title,
      price: newTicket.body.price,
      userId: newTicket.body.userId,
      version: 0,
    });
});

it("return 400 with an invalid id", async () => {
  await request(app)
    .get(`/api/tickets/1231231231`)
    .send({})
    .expect(400, { errors: [{ message: "Invalid id format", field: "id" }] });
});

it("return 404 if a ticket doesnt exist", async () => {
  await request(app)
    .get("/api/tickets/654bed20e82a1a7ac4fe027f") //random id
    .send({})
    .expect(404, { errors: [{ message: "Ticket not found" }] });
});
