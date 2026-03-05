import { ReviewRepository } from "../../../repositories/review.repository";
import { ReviewModel } from "../../../model/review.model";

jest.mock("../../../model/review.model", () => {
  const ReviewModel = jest.fn();
  (ReviewModel as any).findById = jest.fn();
  (ReviewModel as any).find = jest.fn();
  (ReviewModel as any).countDocuments = jest.fn();
  (ReviewModel as any).findByIdAndUpdate = jest.fn();
  (ReviewModel as any).findByIdAndDelete = jest.fn();
  return { ReviewModel };
});

describe("ReviewRepository", () => {
  const repository = new ReviewRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createReview saves review", async () => {
    const saved = { _id: "rev1" };
    (ReviewModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(saved),
    }));

    const result = await repository.createReview({ rating: 5 } as any);

    expect(result).toEqual(saved);
  });

  test("2. getReviewById populates customer and restaurant", async () => {
    const populateRestaurant = jest.fn().mockResolvedValue({ _id: "rev1" });
    const populateCustomer = jest
      .fn()
      .mockReturnValue({ populate: populateRestaurant });
    (ReviewModel as any).findById.mockReturnValue({
      populate: populateCustomer,
    });

    const result = await repository.getReviewById("rev1");

    expect(result).toEqual({ _id: "rev1" });
  });

  test("3. getReviewsByRestaurant filters and sorts", async () => {
    const sort = jest.fn().mockResolvedValue([{ _id: "rev1" }]);
    const populate = jest.fn().mockReturnValue({ sort });
    (ReviewModel as any).find.mockReturnValue({ populate });

    const result = await repository.getReviewsByRestaurant("r1");

    expect(result).toEqual([{ _id: "rev1" }]);
  });

  test("4. getReviewsByCustomer filters and sorts", async () => {
    const sort = jest.fn().mockResolvedValue([{ _id: "rev1" }]);
    const populate = jest.fn().mockReturnValue({ sort });
    (ReviewModel as any).find.mockReturnValue({ populate });

    const result = await repository.getReviewsByCustomer("c1");

    expect(result).toEqual([{ _id: "rev1" }]);
  });

  test("5. getAllPaginated returns reviews and total", async () => {
    (ReviewModel as any).countDocuments.mockResolvedValue(2);
    const sort = jest.fn().mockResolvedValue([{ _id: "rev1" }]);
    const select = jest.fn().mockReturnValue({ sort });
    const limit = jest.fn().mockReturnValue({ select });
    const skip = jest.fn().mockReturnValue({ limit });
    (ReviewModel as any).find.mockReturnValue({ skip });

    const result = await repository.getAllPaginated(1, 10);

    expect(result.total).toBe(2);
    expect(result.reviews).toEqual([{ _id: "rev1" }]);
  });

  test("6. updateReview updates review", async () => {
    const updated = { _id: "rev1", comment: "Updated" };
    (ReviewModel as any).findByIdAndUpdate.mockResolvedValue(updated);

    const result = await repository.updateReview("rev1", {
      comment: "Updated",
    } as any);

    expect(result).toEqual(updated);
  });

  test("7. deleteReview returns boolean", async () => {
    (ReviewModel as any).findByIdAndDelete.mockResolvedValue({ _id: "rev1" });
    await expect(repository.deleteReview("rev1")).resolves.toBe(true);

    (ReviewModel as any).findByIdAndDelete.mockResolvedValue(null);
    await expect(repository.deleteReview("rev2")).resolves.toBe(false);
  });

  test("8. getReviewsForOwner returns only reviews with populated restaurant", async () => {
    const sort = jest.fn().mockResolvedValue([
      { _id: "a", restaurant: { _id: "r1" } },
      { _id: "b", restaurant: null },
    ]);
    const populateCustomer = jest.fn().mockReturnValue({ sort });
    const populateRestaurant = jest
      .fn()
      .mockReturnValue({ populate: populateCustomer });
    (ReviewModel as any).find.mockReturnValue({ populate: populateRestaurant });

    const result = await repository.getReviewsForOwner("owner1");

    expect(result).toEqual([{ _id: "a", restaurant: { _id: "r1" } }]);
  });
});
