import request from "supertest";
import app from "../../app";
import { UserModel } from "../../model/user.model";

let ownerToken: string;
let customerToken: string;
let restaurantId: string;

const ownerUser = {
  email: `owner${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Owner User",
  role: "Restaurant Owner",
};

const customerUser = {
  email: `customer${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Customer User",
  role: "Customer",
};

describe("RESTAURANT API - 20 INTEGRATION TESTS", () => {
  test("1. Register restaurant owner", async () => {
    const res = await request(app).post("/api/auth/register").send(ownerUser);

    expect(res.status).toBe(201);
  });
  test("2. Login restaurant owner", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: ownerUser.email,
      password: ownerUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    ownerToken = res.body.token;
  });
  test("3. Register customer", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(customerUser);

    expect(res.status).toBe(201);
  });
  test("4. Login customer", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: customerUser.email,
      password: customerUser.password,
    });

    expect(res.status).toBe(200);
    customerToken = res.body.token;
  });
  test("5. Owner creates restaurant successfully", async () => {
    const res = await request(app)
      .post("/api/restaurant/create")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Test Restaurant",
        description: "Best food in town",
        address: "Kathmandu, Nepal",
        contactNumber: "9800000000",
        category: "Fast Food",
        openingTime: "09:00",
        closingTime: "22:00",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();

    restaurantId = res.body.data._id;
  });
  test("6. Customer cannot create restaurant", async () => {
    const res = await request(app)
      .post("/api/restaurant/create")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Illegal Restaurant",
        description: "Hack",
        address: "Nowhere",
        contactNumber: "9800000000",
        category: "Fast Food",
        openingTime: "09:00",
        closingTime: "22:00",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("7. Create restaurant without token fails", async () => {
    const res = await request(app).post("/api/restaurant/create").send({
      name: "No Auth",
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("8. Owner fetches own restaurant", async () => {
    const res = await request(app)
      .get("/api/restaurant/my-restaurant")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(restaurantId);
  });
  test("9. Customer cannot access my-restaurant", async () => {
    const res = await request(app)
      .get("/api/restaurant/my-restaurant")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("10. Public can fetch restaurant by ID", async () => {
    const res = await request(app).get(`/api/restaurant/${restaurantId}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(restaurantId);
  });
  test("11. Get all restaurants", async () => {
    const res = await request(app).get("/api/restaurant");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  test("12. Owner updates restaurant", async () => {
    const res = await request(app)
      .put("/api/restaurant/update")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Updated Restaurant Name",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Restaurant Name");
  });
  test("13. Customer cannot update restaurant", async () => {
    const res = await request(app)
      .put("/api/restaurant/update")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Hack Attempt",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("14. Update without token fails", async () => {
    const res = await request(app).put("/api/restaurant/update").send({
      name: "No Auth",
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("15. Owner deletes restaurant", async () => {
    const res = await request(app)
      .delete("/api/restaurant")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
  });
  test("16. Deleted restaurant cannot be fetched", async () => {
    const res = await request(app).get(`/api/restaurant/${restaurantId}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("17. Cannot delete restaurant twice", async () => {
    const res = await request(app)
      .delete("/api/restaurant")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("18. Cannot update deleted restaurant", async () => {
    const res = await request(app)
      .put("/api/restaurant/update")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "After Delete",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
  test("19. Cleanup - delete users from DB", async () => {
    const ownerDeleted = await UserModel.findOneAndDelete({
      email: ownerUser.email,
    });

    const customerDeleted = await UserModel.findOneAndDelete({
      email: customerUser.email,
    });

    expect(ownerDeleted).toBeTruthy();
    expect(customerDeleted).toBeTruthy();
  });
  test("20. Deleted owner cannot access my-restaurant", async () => {
    const res = await request(app)
      .get("/api/restaurant/my-restaurant")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
