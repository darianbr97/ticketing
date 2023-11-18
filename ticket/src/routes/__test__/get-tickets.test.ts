import request from "supertest";
import app from "../../app";

it("anyone can list the tickets", async () => {
  const ticket1 = await createTicket();
  const ticket2 = await createTicket();
  const ticket3 = await createTicket();

  await request(app)
    .get("/api/tickets")
    .send({})
    .expect(200, {
      tickets: [
        {
          id: ticket1.body.id,
          title: ticket1.body.title,
          price: ticket1.body.price,
          userId: ticket1.body.userId,
          version: 0,
        },
        {
          id: ticket2.body.id,
          title: ticket2.body.title,
          price: ticket2.body.price,
          userId: ticket2.body.userId,
          version: 0,
        },
        {
          id: ticket3.body.id,
          title: ticket3.body.title,
          price: ticket3.body.price,
          userId: ticket3.body.userId,
          version: 0,
        },
      ],
      total: 3,
    });
});
