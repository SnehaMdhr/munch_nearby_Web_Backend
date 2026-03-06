import { RestaurantService } from "../../../services/restaurant.service";
import { HttpError } from "../../../errors/http-error";
import { RestaurantStatus } from "../../../types/restaurant.type";
import { ReviewModel } from "../../../model/review.model";
import { MenuModel } from "../../../model/menu.model";
import { FavouriteModel } from "../../../model/favourite.model";
import { RestaurantModel } from "../../../model/restaurant.model";
import { sendEmail } from "../../../config/email";

jest.mock("../../../repositories/restaurant.repositiry", () => {
  const mockRestaurantRepository = {
    getRestaurantByOwner: jest.fn(),
    createRestaurant: jest.fn(),
    getRestaurantById: jest.fn(),
    getAllRestaurants: jest.fn(),
    getAllPaginated: jest.fn(),
    updateRestaurant: jest.fn(),
    deleteRestaurant: jest.fn(),
  };

  return {
    RestaurantRepository: jest
      .fn()
      .mockImplementation(() => mockRestaurantRepository),
    mockRestaurantRepository,
  };
});

jest.mock("../../../utils/extractLatLng", () => ({ extractLatLng: jest.fn() }));
jest.mock("../../../utils/geocode", () => ({ geocodeAddress: jest.fn() }));

jest.mock("../../../model/review.model", () => ({
  ReviewModel: { deleteMany: jest.fn() },
}));
jest.mock("../../../model/menu.model", () => ({
  MenuModel: { deleteMany: jest.fn() },
}));
jest.mock("../../../model/favourite.model", () => ({
  FavouriteModel: { deleteMany: jest.fn() },
}));

jest.mock("../../../model/restaurant.model", () => ({
  RestaurantModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("../../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

import { extractLatLng } from "../../../utils/extractLatLng";
import { geocodeAddress } from "../../../utils/geocode";

const { mockRestaurantRepository } = jest.requireMock(
  "../../../repositories/restaurant.repositiry",
);

describe("RestaurantService", () => {
  const service = new RestaurantService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createRestaurant throws if owner already has one", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue({
      _id: "r1",
    });

    await expect(
      service.createRestaurant("o1", { address: "A" } as any),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("2. createRestaurant geocodes and creates restaurant", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue(null);
    (extractLatLng as jest.Mock).mockReturnValue(null);
    (geocodeAddress as jest.Mock).mockResolvedValue({
      latitude: 27.7,
      longitude: 85.3,
    });
    mockRestaurantRepository.createRestaurant.mockResolvedValue({ _id: "r1" });

    const result = await service.createRestaurant("507f1f77bcf86cd799439011", {
      name: "Rest",
      address: "Kathmandu",
    } as any);

    expect(result).toEqual({ _id: "r1" });
  });

  test("3. getRestaurantByOwner throws when missing", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue(null);

    await expect(service.getRestaurantByOwner("o1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("4. getRestaurantById throws when missing", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue(null);

    await expect(service.getRestaurantById("r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("5. getAllRestaurants and getAllPaginated proxy repository", async () => {
    mockRestaurantRepository.getAllRestaurants.mockResolvedValue([
      { _id: "r1" },
    ]);
    mockRestaurantRepository.getAllPaginated.mockResolvedValue({
      restaurants: [],
      total: 0,
    });

    await expect(service.getAllRestaurants()).resolves.toEqual([{ _id: "r1" }]);
    await expect(service.getAllPaginated(1, 10, "k")).resolves.toEqual({
      restaurants: [],
      total: 0,
    });
  });

  test("6. updateRestaurant throws when owner restaurant missing", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue(null);

    await expect(
      service.updateRestaurant("o1", { name: "New" } as any),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("7. deleteRestaurant cascades deletes", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue({
      _id: "r1",
    });
    (RestaurantModel.findById as jest.Mock).mockResolvedValue({
      _id: "r1",
      imageUrl: undefined,
    });
    (ReviewModel.deleteMany as jest.Mock).mockResolvedValue({});
    (MenuModel.deleteMany as jest.Mock).mockResolvedValue({});
    (FavouriteModel.deleteMany as jest.Mock).mockResolvedValue({});
    mockRestaurantRepository.deleteRestaurant.mockResolvedValue(true);

    await expect(service.deleteRestaurant("o1")).resolves.toBe(true);
    expect(ReviewModel.deleteMany).toHaveBeenCalledWith({ restaurant: "r1" });
  });

  test("8. approve/reject/suspend send emails", async () => {
    const populate = jest.fn().mockResolvedValue({
      _id: "r1",
      name: "Rest",
      owner: { name: "Owner", email: "o@mail.com" },
    });
    (RestaurantModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      populate,
    });

    await expect(service.approveRestaurant("r1")).resolves.toBeTruthy();
    await expect(service.rejectRestaurant("r1")).resolves.toBeTruthy();
    await expect(service.suspendRestaurant("r1")).resolves.toBeTruthy();
    expect(sendEmail).toHaveBeenCalledTimes(3);
  });

  test("9. deleteRestaurantByAdmin delegates to cascade", async () => {
    (RestaurantModel.findById as jest.Mock).mockResolvedValue({
      _id: "r1",
      imageUrl: undefined,
    });
    (ReviewModel.deleteMany as jest.Mock).mockResolvedValue({});
    (MenuModel.deleteMany as jest.Mock).mockResolvedValue({});
    (FavouriteModel.deleteMany as jest.Mock).mockResolvedValue({});
    mockRestaurantRepository.deleteRestaurant.mockResolvedValue(true);

    await expect(service.deleteRestaurantByAdmin("r1")).resolves.toBe(true);
  });

  test("10. getAllRestaurantsForAdmin returns sorted restaurants", async () => {
    const sort = jest.fn().mockResolvedValue([{ _id: "r1" }]);
    const populate = jest.fn().mockReturnValue({ sort });
    (RestaurantModel.find as jest.Mock).mockReturnValue({ populate });

    await expect(service.getAllRestaurantsForAdmin()).resolves.toEqual([
      { _id: "r1" },
    ]);
  });

  test("11. status operations throw when restaurant not found", async () => {
    const populate = jest.fn().mockResolvedValue(null);
    (RestaurantModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      populate,
    });

    await expect(service.approveRestaurant("r1")).rejects.toBeInstanceOf(
      HttpError,
    );
    await expect(service.rejectRestaurant("r1")).rejects.toBeInstanceOf(
      HttpError,
    );
    await expect(service.suspendRestaurant("r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("12. approve updates approved status", async () => {
    const populate = jest.fn().mockResolvedValue({ _id: "r1", owner: {} });
    (RestaurantModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      populate,
    });

    await service.approveRestaurant("r1");

    expect(RestaurantModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "r1",
      { status: RestaurantStatus.APPROVED },
      { new: true },
    );
  });
});
