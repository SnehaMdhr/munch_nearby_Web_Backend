import request from "supertest";
import app from "../../app";
import { UserModel } from "../../model/user.model";


let token: string;
let secondToken: string;

const validUser = {
  email: `test${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Test User",
  role: "Customer"
};

const secondUser = {
  email: `second${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Second User",
  role: "Customer"
};

describe("AUTH API - 25 TESTS", () => {

  // 1
  test("1. Register user successfully", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send(validUser);

  console.log(res.body); // ADD THIS

  expect(res.status).toBe(201);
});
  // 2
  test("2. Register second user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(secondUser);

    expect(res.status).toBe(201);
  });

  // 3
  test("3. Fail register with short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...validUser,
        email: `short${Date.now()}@mail.com`,
        password: "123"
      });

    expect(res.status).toBe(400);
  });

  // 4
  test("4. Fail register with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...validUser,
        email: "invalid-email"
      });

    expect(res.status).toBe(400);
  });

  // 5
  test("5. Fail register with missing email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        password: "Password123"
      });

    expect(res.status).toBe(400);
  });

  // 6
  test("6. Login successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
        password: validUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  // 7
  test("7. Login second user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: secondUser.email,
        password: secondUser.password
      });

    expect(res.status).toBe(200);
    secondToken = res.body.token;
  });

  // 8
  test("8. Fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
        password: "WrongPass"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 9
  test("9. Fail login with unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@mail.com",
        password: "Password123"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 10
  test("10. whoami without token should fail", async () => {
    const res = await request(app)
      .get("/api/auth/whoami");

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 11
  test("11. whoami with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // 12
  test("12. whoami with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer invalidtoken`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 13
  test("13. Update name successfully", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
  });

  // 14
  test("14. Update password successfully", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "NewPassword123" });

    expect(res.status).toBe(200);
  });

  // 15
  test("15. Fail update without token", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .send({ name: "No Token" });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 16
  test("16. Fail update with invalid token", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("Authorization", `Bearer invalid`)
      .send({ name: "Invalid Token" });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 17
  test("17. Update role successfully", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Restaurant Owner" });

    expect(res.status).toBe(200);
  });

  // 18 - delete second user directly from DB
  test("18. Delete second user", async () => {
    const deleted = await UserModel.findOneAndDelete({ email: secondUser.email }).exec();
    expect(deleted).toBeTruthy();
  });

  // 19 - Deleted user cannot login
  test("19. Deleted user cannot login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: secondUser.email,
        password: secondUser.password
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 20 - delete main user directly from DB
  test("20. Delete main user", async () => {
    const deleted = await UserModel.findOneAndDelete({ email: validUser.email }).exec();
    expect(deleted).toBeTruthy();
  });

  // 21 - Deleted user cannot whoami
  test("21. Deleted user cannot whoami", async () => {
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });


  // 22
  test("22. Register user with admin role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `admin${Date.now()}@mail.com`,
        password: "Password123",
        role: "admin",
        confirmPassword: "Password123"
      });

    expect(res.status).toBe(201);
  });

  // 23
  test("23. Register user without role (default Customer)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `default${Date.now()}@mail.com`,
        password: "Password123"
        ,confirmPassword: "Password123"
      });

    expect(res.status).toBe(201);
  });

  // 24
  test("24. Register with extra field should fail or ignore", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `extra${Date.now()}@mail.com`,
        password: "Password123",
        unknownField: "value"
      });

    expect([201, 400]).toContain(res.status);
  });

  // 25
  test("25. Login missing password should fail", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

});
