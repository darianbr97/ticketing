import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

declare global {
  var authenticate: (userId?: string) => string[];
}

jest.mock("../nats-service.ts");

process.env.STRIPE_KEY =
  "sk_test_51Nu7BaFKxfykXpdWeDxQECFLQCqkWTgsyiDwdTWWjrSjFvhfGizZExbggY03dPoBPwxueUhoDHstDG4U9NDf1f5C00tVlHFGre";

let mongodb: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongodb = await MongoMemoryServer.create();
  const mongoUri = mongodb.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongodb?.stop();
  await mongoose.connection.close();
});

global.authenticate = (userId?: string) => {
  const payload = {
    id: userId || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const jwtPayload = jwt.sign(payload, process.env.JWT_KEY!);
  const cookie = JSON.stringify({ jwt: jwtPayload });
  const base64 = Buffer.from(cookie).toString("base64");

  return [`session=${base64}`];
};
