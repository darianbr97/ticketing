import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

declare global {
  var authenticate: () => Promise<string[]>;
  var createUser: () => request.Test;
  var signUser: () => request.Test;
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.authenticate = async () => {
  const email = "test@test.com";
  const password = "password";

  const res = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  //extract jwt from cookie
  const cookie = res.get("Set-Cookie");
  return cookie;
};

global.createUser = () => {
  return request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "password",
  });
};

global.signUser = () => {
  return request(app).post("/api/users/signin").send({
    email: "test@test.com",
    password: "password",
  });
};
