import { FavouriteRepository } from "../../../repositories/favourite.repository";
import { FavouriteModel } from "../../../model/favourite.model";

jest.mock("../../../model/favourite.model", () => {
  const FavouriteModel = jest.fn();
  (FavouriteModel as any).findOne = jest.fn();
  (FavouriteModel as any).find = jest.fn();
  (FavouriteModel as any).findOneAndDelete = jest.fn();
  return { FavouriteModel };
});

describe("FavouriteRepository", () => {
  const repository = new FavouriteRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. create saves favourite", async () => {
    const saved = { _id: "f1" };
    (FavouriteModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(saved),
    }));

    const result = await repository.create({
      customer: "c1",
      restaurant: "r1",
    } as any);

    expect(result).toEqual(saved);
  });

  test("2. find returns matching favourite", async () => {
    const fav = { _id: "f1" };
    (FavouriteModel as any).findOne.mockResolvedValue(fav);

    const result = await repository.find("c1", "r1");

    expect(result).toEqual(fav);
  });

  test("3. findByCustomer populates restaurant", async () => {
    const populate = jest.fn().mockResolvedValue([{ _id: "f1" }]);
    (FavouriteModel as any).find.mockReturnValue({ populate });

    const result = await repository.findByCustomer("c1");

    expect(result).toEqual([{ _id: "f1" }]);
    expect(populate).toHaveBeenCalledWith("restaurant");
  });

  test("4.  delete returns boolean", async () => {
    (FavouriteModel as any).findOneAndDelete.mockResolvedValue({ _id: "f1" });
    await expect(repository.delete("c1", "r1")).resolves.toBe(true);

    (FavouriteModel as any).findOneAndDelete.mockResolvedValue(null);
    await expect(repository.delete("c1", "r2")).resolves.toBe(false);
  });
});
