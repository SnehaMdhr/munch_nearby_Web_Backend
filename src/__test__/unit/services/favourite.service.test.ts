import mongoose from "mongoose";
import { FavoriteService } from "../../../services/favourite.service";
import { HttpError } from "../../../errors/http-error";
import { FavouriteModel } from "../../../model/favourite.model";

jest.mock("../../../repositories/favourite.repository", () => {
  const mockFavouriteRepository = {
    find: jest.fn(),
    delete: jest.fn(),
    findByCustomer: jest.fn(),
  };

  return {
    FavouriteRepository: jest
      .fn()
      .mockImplementation(() => mockFavouriteRepository),
    mockFavouriteRepository,
  };
});

jest.mock("../../../repositories/restaurant.repositiry", () => {
  const mockRestaurantRepository = {
    getRestaurantById: jest.fn(),
  };

  return {
    RestaurantRepository: jest
      .fn()
      .mockImplementation(() => mockRestaurantRepository),
    mockRestaurantRepository,
  };
});

jest.mock("../../../model/favourite.model", () => ({
  FavouriteModel: { create: jest.fn() },
}));

const { mockFavouriteRepository } = jest.requireMock(
  "../../../repositories/favourite.repository",
);
const { mockRestaurantRepository } = jest.requireMock(
  "../../../repositories/restaurant.repositiry",
);

describe("FavoriteService", () => {
  const service = new FavoriteService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. addToFavorite throws when restaurant does not exist", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue(null);

    await expect(service.addToFavorite("c1", "r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("2. addToFavorite throws when already exists", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue({ _id: "r1" });
    mockFavouriteRepository.find.mockResolvedValue({ _id: "f1" });

    await expect(service.addToFavorite("c1", "r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("3. removeFromFavorite throws when not found", async () => {
    mockFavouriteRepository.delete.mockResolvedValue(false);

    await expect(service.removeFromFavorite("c1", "r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("4. removeFromFavorite returns true", async () => {
    mockFavouriteRepository.delete.mockResolvedValue(true);

    await expect(service.removeFromFavorite("c1", "r1")).resolves.toBe(true);
  });

  test("5. getMyFavorites returns customer favorites", async () => {
    mockFavouriteRepository.findByCustomer.mockResolvedValue([{ _id: "f1" }]);

    await expect(service.getMyFavorites("c1")).resolves.toEqual([
      { _id: "f1" },
    ]);
  });
});
