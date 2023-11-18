import request from "supertest";
import app from "../../app";

it("returns a 200 with success sing in", async () => {
  await createUser();
  await signUser().expect(200);
});

it("returns a 400 for unregistered email", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400, {
      errors: [{ message: "Invalid credentials" }],
    });
});

it("returns 400 for invalid password", async () => {
  await createUser();

  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "123456",
    })
    .expect(400, {
      errors: [{ message: "Invalid credentials" }],
    });
});

it("returns a 400 with missing email", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      password: "password",
    })
    .expect(400, {
      errors: [{ message: "Email is required", field: "email" }],
    });
});

it("returns a 400 with missing password", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
    })
    .expect(400, {
      errors: [{ message: "Password is required", field: "password" }],
    });
});

it("jwt created successfully", async () => {
  await createUser();

  const res = await signUser();

  expect(res.get("Set-Cookie")).toBeDefined();
});
