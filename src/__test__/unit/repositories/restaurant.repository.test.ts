import mongoose from "mongoose";
import { RestaurantRepository } from "../../../repositories/restaurant.repositiry";
import { RestaurantModel } from "../../../model/restaurant.model";
import { RestaurantStatus } from "../../../types/restaurant.type";

jest.mock("../../../model/restaurant.model", () => {
  const RestaurantModel = jest.fn();
  (RestaurantModel as any).findByIdAndUpdate = jest.fn();
  (RestaurantModel as any).findOne = jest.fn();
  (RestaurantModel as any).find = jest.fn();
  (RestaurantModel as any).countDocuments = jest.fn();
  (RestaurantModel as any).findByIdAndDelete = jest.fn();
  return { RestaurantModel };
});

describe("RestaurantRepository", () => {
  const repository = new RestaurantRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. updateStatus updates restaurant status", async () => {
    const updated = { _id: "r1", status: RestaurantStatus.APPROVED };
    (RestaurantModel as any).findByIdAndUpdate.mockResolvedValue(updated);

    const result = await repository.updateStatus(
      "r1",
      RestaurantStatus.APPROVED,
    );

    expect(result).toEqual(updated);
  });

  test("2. softDeleteByAdmin returns boolean", async () => {
    (RestaurantModel as any).findByIdAndUpdate.mockResolvedValue({ _id: "r1" });
    await expect(repository.softDeleteByAdmin("r1")).resolves.toBe(true);

    (RestaurantModel as any).findByIdAndUpdate.mockResolvedValue(null);
    await expect(repository.softDeleteByAdmin("r2")).resolves.toBe(false);
  });

  test("3. createRestaurant saves restaurant", async () => {
    const saved = { _id: "r1" };
    (RestaurantModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(saved),
    }));

    const result = await repository.createRestaurant({ name: "R" } as any);

    expect(result).toEqual(saved);
  });

  test("4. getRestaurantById returns null for invalid object id", async () => {
    const isValidSpy = jest
      .spyOn(mongoose.Types.ObjectId, "isValid")
      .mockReturnValue(false);

    const result = await repository.getRestaurantById("invalid");

    expect(result).toBeNull();
    expect((RestaurantModel as any).findOne).not.toHaveBeenCalled();
    isValidSpy.mockRestore();
  });

  test("5. getRestaurantById queries and populates owner", async () => {
    const populate = jest.fn().mockResolvedValue({ _id: "r1" });
    (RestaurantModel as any).findOne.mockReturnValue({ populate });
    const isValidSpy = jest
      .spyOn(mongoose.Types.ObjectId, "isValid")
      .mockReturnValue(true);

    const result = await repository.getRestaurantById(
      "507f1f77bcf86cd799439011",
    );

    expect(result).toEqual({ _id: "r1" });
    expect(populate).toHaveBeenCalledWith("owner", "name email role");
    isValidSpy.mockRestore();
  });

  test("6. getRestaurantByOwner populates chained relations", async () => {
    const exec = jest.fn().mockResolvedValue({ _id: "r1" });
    const populateReviews = jest.fn().mockReturnValue({ exec });
    const populateMenus = jest
      .fn()
      .mockReturnValue({ populate: populateReviews });
    const populateOwner = jest
      .fn()
      .mockReturnValue({ populate: populateMenus });
    (RestaurantModel as any).findOne.mockReturnValue({
      populate: populateOwner,
    });

    const result = await repository.getRestaurantByOwner("u1");

    expect(result).toEqual({ _id: "r1" });
  });

  test("7. getAllRestaurants fetches approved and not deleted", async () => {
    const populate = jest.fn().mockResolvedValue([{ _id: "r1" }]);
    (RestaurantModel as any).find.mockReturnValue({ populate });

    const result = await repository.getAllRestaurants();

    expect(result).toEqual([{ _id: "r1" }]);
  });

  test("8. getAllPaginated returns restaurants and total", async () => {
    (RestaurantModel as any).countDocuments.mockResolvedValue(4);
    const sort = jest.fn().mockResolvedValue([{ _id: "r1" }]);
    const populate = jest.fn().mockReturnValue({ sort });
    const select = jest.fn().mockReturnValue({ populate });
    const limit = jest.fn().mockReturnValue({ select });
    const skip = jest.fn().mockReturnValue({ limit });
    (RestaurantModel as any).find.mockReturnValue({ skip });

    const result = await repository.getAllPaginated(1, 10, "fast");

    expect(result.total).toBe(4);
    expect(result.restaurants).toEqual([{ _id: "r1" }]);
  });

  test("9. updateRestaurant updates by id", async () => {
    const updated = { _id: "r1" };
    (RestaurantModel as any).findByIdAndUpdate.mockResolvedValue(updated);

    const result = await repository.updateRestaurant("r1", {
      name: "N",
    } as any);

    expect(result).toEqual(updated);
  });

  test("10. deleteRestaurant returns boolean", async () => {
    (RestaurantModel as any).findByIdAndDelete.mockResolvedValue({ _id: "r1" });
    await expect(repository.deleteRestaurant("r1")).resolves.toBe(true);

    (RestaurantModel as any).findByIdAndDelete.mockResolvedValue(null);
    await expect(repository.deleteRestaurant("r2")).resolves.toBe(false);
  });
});
