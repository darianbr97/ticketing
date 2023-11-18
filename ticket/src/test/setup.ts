import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app";

declare global {
  var authenticate: (userId?: string) => string[];
  var createTicket: (customJwtCookie?: string[]) => request.Test;
}

jest.mock("../nats-service.ts");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
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

global.createTicket = (customJwtCookie?: string[]) => {
  const jwtCookie = authenticate();

  return request(app)
    .post("/api/tickets")
    .set("Cookie", customJwtCookie || jwtCookie)
    .send({ title: "shoes", price: "10.99" })
    .expect(201);
};
