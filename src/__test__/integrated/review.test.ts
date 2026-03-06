import request from "supertest";
import app from "../../app";
import { UserModel } from "../../model/user.model";
import { RestaurantModel } from "../../model/restaurant.model";
import { ReviewModel } from "../../model/review.model";
import { RestaurantStatus } from "../../types/restaurant.type";

let customerToken: string;
let ownerToken: string;
let adminToken: string;
let restaurantId: string;
let reviewId: string;

const customerUser = {
  email: `review-customer-${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Review Customer",
  role: "Customer",
};

const ownerUser = {
  email: `review-owner-${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Review Owner",
  role: "Restaurant Owner",
};

const adminUser = {
  email: `review-admin-${Date.now()}@mail.com`,
  password: "Password123",
  confirmPassword: "Password123",
  name: "Review Admin",
  role: "admin",
};

describe("REVIEW API - INTEGRATION", () => {
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

    const registerAdmin = await request(app)
      .post("/api/auth/register")
      .send(adminUser);
    expect(registerAdmin.status).toBe(201);

    const loginAdmin = await request(app).post("/api/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    expect(loginAdmin.status).toBe(200);
    adminToken = loginAdmin.body.token;

    const owner = await UserModel.findOne({ email: ownerUser.email });
    if (!owner) {
      throw new Error("Owner user not found");
    }

    const restaurant = await RestaurantModel.create({
      name: "Review Test Restaurant",
      address: "Kathmandu, Nepal",
      contactNumber: "9800000000",
      owner: owner._id,
      status: RestaurantStatus.APPROVED,
    });

    restaurantId = restaurant._id.toString();
    expect(restaurantId).toBeDefined();
  }, 30000);

  test("2. Customer creates review", async () => {
    const res = await request(app)
      .post(`/api/review/create/${restaurantId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        rating: 5,
        comment: "Great food and friendly service",
      });

    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
    reviewId = res.body.data._id;
  });

  test("3. Duplicate review should fail", async () => {
    const res = await request(app)
      .post(`/api/review/create/${restaurantId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        rating: 4,
        comment: "Trying to submit duplicate review",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("4. Create review without token should fail", async () => {
    const res = await request(app)
      .post(`/api/review/create/${restaurantId}`)
      .send({
        rating: 4,
        comment: "No auth token here",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("5. Get reviews by restaurant", async () => {
    const res = await request(app).get(
      `/api/review/restaurant/${restaurantId}`,
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("6. Customer updates own review", async () => {
    const res = await request(app)
      .put(`/api/review/update/${reviewId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        rating: 4,
        comment: "Updated review after second visit",
      });

    expect(res.status).toBe(200);
  });

  test("7. Owner cannot update customer review", async () => {
    const res = await request(app)
      .put(`/api/review/update/${reviewId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        rating: 3,
        comment: "Owner should not do this",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("8. Owner fetches reviews for own restaurant", async () => {
    const res = await request(app)
      .get("/api/review/owner/my-reviews")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("9. Admin deletes review", async () => {
    const res = await request(app)
      .delete(`/api/review/admin/delete/${reviewId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  test("10. Deleted review cannot be updated", async () => {
    const res = await request(app)
      .put(`/api/review/update/${reviewId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        rating: 2,
        comment: "Trying to update deleted review",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("11. Cleanup test data", async () => {
    await ReviewModel.deleteMany({ restaurant: restaurantId });
    await RestaurantModel.deleteMany({ _id: restaurantId });
    await UserModel.deleteMany({
      email: { $in: [customerUser.email, ownerUser.email, adminUser.email] },
    });

    const usersLeft = await UserModel.find({
      email: { $in: [customerUser.email, ownerUser.email, adminUser.email] },
    });

    expect(usersLeft.length).toBe(0);
  });
});
