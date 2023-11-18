import request from "supertest";
import app from "../../app";

it("get current user successfully", async () => {
  await createUser();
  const signRes = await signUser();

  const userRes = await request(app)
    .get("/api/users/currentUser")
    .set("Cookie", signRes.get("Set-Cookie"))
    .send()
    .expect(200);

  expect(userRes.body.currentUser.email).toEqual("test@test.com");
});

it("get - null - value for current user logged if there isnt a jwt cookie", async () => {
  await request(app)
    .get("/api/users/currentUser")
    .send({})
    .expect(200, { currentUser: null });
});
