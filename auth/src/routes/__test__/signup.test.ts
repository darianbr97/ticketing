import request from "supertest";
import app from "../../app";

it("returns a 201 on signup", async () => {
  await createUser().expect(201);
});

it("returns a 400 with invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test.com",
      password: "password",
    })
    .expect(400, {
      errors: [{ message: "Invalid email format", field: "email" }],
    });
});

it("returns a 400 with invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "passw",
    })
    .expect(400, {
      errors: [
        {
          message: "Password must be between 6 and 20 characters",
          field: "password",
        },
      ],
    });
});

it("don´t allow duplicate email", async () => {
  await createUser();

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400, {
      errors: [{ message: "Email already exists" }],
    });
});

it("returns a 400 with missing email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      password: "password",
    })
    .expect(400, {
      errors: [{ message: "Email is required", field: "email" }],
    });
});

it("returns a 400 with missing password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
    })
    .expect(400, {
      errors: [{ message: "Password is required", field: "password" }],
    });
});

it("jwt created successfully", async () => {
  const res = await createUser();

  expect(res.get("Set-Cookie")).toBeDefined();
});
