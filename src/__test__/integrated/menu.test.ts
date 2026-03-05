import request from "supertest";
import app from "../../app";
import { UserModel } from "../../model/user.model";
import { RestaurantModel } from "../../model/restaurant.model";
import { MenuModel } from "../../model/menu.model";
import { RestaurantStatus } from "../../types/restaurant.type";

let ownerToken: string;
let adminToken: string;
let restaurantId: string;
let menuId: string;

const ownerUser = {
  email: `owner${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Owner User",
  role: "Restaurant Owner",
};

const adminUser = {
  email: `admin${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Admin User",
  role: "admin",
};

describe("MENU API - 15 TESTS", () => {
  // Combined test for setup (register owner, login, register admin, login admin, create restaurant)
  test("1. Setup: Register owner, login, register admin, login admin, create restaurant", async () => {
    // Register owner
    const res1 = await request(app).post("/api/auth/register").send(ownerUser);
    expect(res1.status).toBe(201);

    // Login owner
    const res2 = await request(app).post("/api/auth/login").send({
      email: ownerUser.email,
      password: ownerUser.password,
    });
    expect(res2.status).toBe(200);
    expect(res2.body.token).toBeDefined();
    ownerToken = res2.body.token;

    // Register admin
    const res3 = await request(app).post("/api/auth/register").send(adminUser);
    expect(res3.status).toBe(201);

    // Login admin
    const res4 = await request(app).post("/api/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    expect(res4.status).toBe(200);
    expect(res4.body.token).toBeDefined();
    adminToken = res4.body.token;

    // Create restaurant
    const owner = await UserModel.findOne({ email: ownerUser.email });
    if (!owner) {
      throw new Error("Owner user not found");
    }
    const restaurant = await RestaurantModel.create({
      name: "Test Restaurant",
      contactNumber: "9812345678",
      address: "Kathmandu",
      owner: owner._id,
      status: RestaurantStatus.APPROVED, // Set to APPROVED to ensure it's accessible
    });
    expect(restaurant).toBeTruthy();
    restaurantId = restaurant._id.toString();
  }, 30000);

  // 2️⃣ Owner Creates Menu
  test("2. Owner creates menu", async () => {
    const res = await request(app)
      .post("/api/menu/create")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Pizza",
        price: 20,
        category: "Fast Food",
        restaurant: restaurantId,
      });

    // Debug: log the error if it fails
    if (res.status !== 201) {
    }
    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
    menuId = res.body.data._id;
  });

  // 3️⃣ Fail Create Without Token
  test("3. Create menu without token should fail", async () => {
    const res = await request(app).post("/api/menu/create").send({
      name: "Burger",
      price: 15,
      restaurant: restaurantId,
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 4️⃣ Get All Menus
  test("4. Get all menus", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
  });

  // 5️⃣ Get Menu By ID
  test("5. Get menu by id", async () => {
    const res = await request(app).get(`/api/menu/${menuId}`);
    expect(res.status).toBe(200);
  });

  // 6️⃣ Owner Updates Menu
  test("6. Owner updates menu", async () => {
    const res = await request(app)
      .put(`/api/menu/update/${menuId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ price: 25 });

    expect(res.status).toBe(200);
  });

  // 7️⃣ Update Without Token
  test("7. Update without token should fail", async () => {
    const res = await request(app)
      .put(`/api/menu/update/${menuId}`)
      .send({ price: 30 });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 8️⃣ Admin Deletes Menu
  test("8. Admin deletes menu", async () => {
    const res = await request(app)
      .delete(`/api/menu/admin/delete/${menuId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  // 9️⃣ Owner Cannot Delete via Admin Route
  test("9. Owner cannot delete via admin route", async () => {
    const res = await request(app)
      .delete(`/api/menu/admin/delete/${menuId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 🔟 Deleted Menu Should Not Exist
  test("10. Deleted menu should return error", async () => {
    const res = await request(app).get(`/api/menu/${menuId}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 1️⃣1️⃣ Cleanup Test Data
  test("11. Cleanup test data", async () => {
    await MenuModel.deleteMany({ restaurant: restaurantId });
    await RestaurantModel.deleteMany({ _id: restaurantId });
    await UserModel.deleteMany({
      email: { $in: [ownerUser.email, adminUser.email] },
    });

    const usersLeft = await UserModel.find({
      email: { $in: [ownerUser.email, adminUser.email] },
    });

    expect(usersLeft.length).toBe(0);
  });
});
