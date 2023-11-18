import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ITicketDoc, Ticket } from "../models/ticket.model";
import request from "supertest";
import app from "../app";

declare global {
  var authenticate: (userId?: string) => string[];
  var createTicket: () => Promise<ITicketDoc>;
  var createOrder: (ticketId: string, userId?: string) => request.Test;
}

jest.mock("../nats-service.ts");

let mongodb: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  mongodb = await MongoMemoryServer.create();
  const uri = mongodb.getUri();

  await mongoose.connect(uri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongodb.stop();
  await mongoose.connection.close();
});

global.authenticate = (userId?: string) => {
  const payload = {
    id: userId || "654bdc60b15103f79a7508da",
    email: "test@test.com",
  };

  const payloadJwt = jwt.sign(payload, process.env.JWT_KEY!);
  const session = JSON.stringify({ jwt: payloadJwt });
  const base64 = Buffer.from(session).toString("base64");

  return [`session=${base64}`];
};

global.createTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toString(),
    title: "Concert",
    price: 10.99,
  });
  await ticket.save();
  return ticket;
};

global.createOrder = (ticketId: string, userId?: string) => {
  return request(app)
    .post("/api/orders")
    .set("Cookie", authenticate(userId))
    .send({ ticketId: ticketId || new mongoose.Types.ObjectId().toString() });
};
