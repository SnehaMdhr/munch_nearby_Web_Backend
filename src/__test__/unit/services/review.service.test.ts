import mongoose from "mongoose";
import { ReviewService } from "../../../services/review.service";
import { HttpError } from "../../../errors/http-error";
import { ReviewModel } from "../../../model/review.model";

jest.mock("../../../repositories/review.repository", () => {
  const mockReviewRepository = {
    createReview: jest.fn(),
    getReviewById: jest.fn(),
    getReviewsByRestaurant: jest.fn(),
    deleteReview: jest.fn(),
    updateReview: jest.fn(),
    getReviewsForOwner: jest.fn(),
  };

  return {
    ReviewRepository: jest.fn().mockImplementation(() => mockReviewRepository),
    mockReviewRepository,
  };
});

jest.mock("../../../repositories/restaurant.repositiry", () => {
  const mockRestaurantRepository = {
    getRestaurantById: jest.fn(),
    updateRestaurant: jest.fn(),
  };

  return {
    RestaurantRepository: jest
      .fn()
      .mockImplementation(() => mockRestaurantRepository),
    mockRestaurantRepository,
  };
});

jest.mock("../../../model/review.model", () => ({
  ReviewModel: {
    findOne: jest.fn(),
    aggregate: jest.fn(),
  },
}));

const { mockReviewRepository } = jest.requireMock(
  "../../../repositories/review.repository",
);
const { mockRestaurantRepository } = jest.requireMock(
  "../../../repositories/restaurant.repositiry",
);

describe("ReviewService", () => {
  const service = new ReviewService();

  beforeEach(() => {
    jest.clearAllMocks();
    (ReviewModel.aggregate as jest.Mock).mockResolvedValue([
      { totalReviews: 1, averageReviews: 4.5 },
    ]);
  });

  test("1. createReview throws if restaurant missing", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue(null);

    await expect(
      service.createReview("c1", {
        restaurantId: "r1",
        rating: 5,
        comment: "good",
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("2. createReview throws if already reviewed", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue({ _id: "r1" });
    (ReviewModel.findOne as jest.Mock).mockResolvedValue({ _id: "rev1" });

    await expect(
      service.createReview("c1", {
        restaurantId: "r1",
        rating: 5,
        comment: "good",
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("3. createReview creates review and refreshes stats", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue({ _id: "r1" });
    (ReviewModel.findOne as jest.Mock).mockResolvedValue(null);
    mockReviewRepository.createReview.mockResolvedValue({ _id: "rev1" });

    const result = await service.createReview("507f1f77bcf86cd799439011", {
      restaurantId: "507f1f77bcf86cd799439012",
      rating: 4,
      comment: "nice",
    });

    expect(result).toEqual({ _id: "rev1" });
    expect(mockRestaurantRepository.updateRestaurant).toHaveBeenCalled();
  });

  test("4. getReviewsByRestaurant validates restaurant", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue(null);

    await expect(service.getReviewsByRestaurant("r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("5. updateReview enforces ownership", async () => {
    mockReviewRepository.getReviewById.mockResolvedValue({
      customer: { _id: "other" },
      restaurant: "507f1f77bcf86cd799439012",
    });

    await expect(
      service.updateReview("c1", "rev1", { comment: "updated" }),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("6. deleteReview deletes owned review", async () => {
    mockReviewRepository.getReviewById.mockResolvedValue({
      customer: { _id: "c1" },
      restaurant: "507f1f77bcf86cd799439012",
    });
    mockReviewRepository.deleteReview.mockResolvedValue(true);

    await expect(service.deleteReview("c1", "rev1")).resolves.toBe(true);
  });

  test("7. getReviewsForOwner validates owner id", async () => {
    const isValidSpy = jest
      .spyOn(mongoose.Types.ObjectId, "isValid")
      .mockReturnValue(false);

    await expect(service.getReviewsForOwner("invalid")).rejects.toBeInstanceOf(
      HttpError,
    );
    isValidSpy.mockRestore();
  });

  test("8. adminDeleteReview deletes and refreshes stats", async () => {
    mockReviewRepository.getReviewById.mockResolvedValue({
      restaurant: "507f1f77bcf86cd799439012",
    });
    mockReviewRepository.deleteReview.mockResolvedValue(true);

    await expect(service.adminDeleteReview("rev1")).resolves.toBe(true);
    expect(mockRestaurantRepository.updateRestaurant).toHaveBeenCalled();
  });
});
