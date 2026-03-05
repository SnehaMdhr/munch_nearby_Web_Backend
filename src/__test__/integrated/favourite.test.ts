import request from "supertest";
import app from "../../app";
import { UserModel } from "../../model/user.model";
import { RestaurantModel } from "../../model/restaurant.model";
import { FavouriteModel } from "../../model/favourite.model";
import { RestaurantStatus } from "../../types/restaurant.type";

let customerToken: string;
let customerTwoToken: string;
let ownerToken: string;
let restaurantId: string;

const customerUser = {
  email: `fav-customer-${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Fav Customer",
  role: "Customer",
};

const customerTwoUser = {
  email: `fav-customer-2-${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Fav Customer Two",
  role: "Customer",
};

const ownerUser = {
  email: `fav-owner-${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Fav Owner",
  role: "Restaurant Owner",
};

describe("FAVOURITE API - INTEGRATION", () => {
  test("1. Setup users login and create approved restaurant", async () => {
    const registerCustomer = await request(app)
      .post("/api/auth/register")
      .send(customerUser);
    expect(registerCustomer.status).toBe(201);

    const loginCustomer = await request(app).post("/api/auth/login").send({
      email: customerUser.email,
      password: customerUser.password,
    });
    expect(loginCustomer.status).toBe(200);
    customerToken = loginCustomer.body.token;

    const registerCustomerTwo = await request(app)
      .post("/api/auth/register")
      .send(customerTwoUser);
    expect(registerCustomerTwo.status).toBe(201);

    const loginCustomerTwo = await request(app).post("/api/auth/login").send({
      email: customerTwoUser.email,
      password: customerTwoUser.password,
    });
    expect(loginCustomerTwo.status).toBe(200);
    customerTwoToken = loginCustomerTwo.body.token;

    const registerOwner = await request(app)
      .post("/api/auth/register")
      .send(ownerUser);
    expect(registerOwner.status).toBe(201);

    const loginOwner = await request(app).post("/api/auth/login").send({
      email: ownerUser.email,
      password: ownerUser.password,
    });
    expect(loginOwner.status).toBe(200);
    ownerToken = loginOwner.body.token;

    const owner = await UserModel.findOne({ email: ownerUser.email });
    if (!owner) {
      throw new Error("Owner user not found");
    }

    const restaurant = await RestaurantModel.create({
      name: "Favourite Test Restaurant",
      address: "Pokhara, Nepal",
      contactNumber: "9800000001",
      owner: owner._id,
      status: RestaurantStatus.APPROVED,
    });

    restaurantId = restaurant._id.toString();
    expect(restaurantId).toBeDefined();
  }, 30000);

  test("2. Customer adds favourite", async () => {
    const res = await request(app)
      .post(`/api/favourite/${restaurantId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("3. Duplicate favourite should fail", async () => {
    const res = await request(app)
      .post(`/api/favourite/${restaurantId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("4. Add favourite without token should fail", async () => {
    const res = await request(app).post(`/api/favourite/${restaurantId}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("5. Owner cannot add favourite", async () => {
    const res = await request(app)
      .post(`/api/favourite/${restaurantId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("6. Customer gets own favourites", async () => {
    const res = await request(app)
      .get("/api/favourite/my")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("7. Another customer does not see first customer's favourite", async () => {
    const res = await request(app)
      .get("/api/favourite/my")
      .set("Authorization", `Bearer ${customerTwoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test("8. Customer removes favourite", async () => {
    const res = await request(app)
      .delete(`/api/favourite/${restaurantId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
  });

  test("9. Removing missing favourite should fail", async () => {
    const res = await request(app)
      .delete(`/api/favourite/${restaurantId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("10. Customer favourites should be empty after removal", async () => {
    const res = await request(app)
      .get("/api/favourite/my")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test("11. Cleanup test data", async () => {
    await FavouriteModel.deleteMany({ restaurant: restaurantId });
    await RestaurantModel.deleteMany({ _id: restaurantId });
    await UserModel.deleteMany({
      email: {
        $in: [customerUser.email, customerTwoUser.email, ownerUser.email],
      },
    });

    const usersLeft = await UserModel.find({
      email: {
        $in: [customerUser.email, customerTwoUser.email, ownerUser.email],
      },
    });

    expect(usersLeft.length).toBe(0);
  });
});
