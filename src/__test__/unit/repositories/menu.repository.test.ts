import { MenuRepository } from "../../../repositories/menu.repository";
import { MenuModel } from "../../../model/menu.model";

jest.mock("../../../model/menu.model", () => {
  const MenuModel = jest.fn();
  (MenuModel as any).findById = jest.fn();
  (MenuModel as any).find = jest.fn();
  (MenuModel as any).countDocuments = jest.fn();
  (MenuModel as any).findByIdAndUpdate = jest.fn();
  (MenuModel as any).findByIdAndDelete = jest.fn();
  return { MenuModel };
});

describe("MenuRepository", () => {
  const repository = new MenuRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createMenu saves menu", async () => {
    const saved = { _id: "m1", name: "Pizza" };
    (MenuModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(saved),
    }));

    const result = await repository.createMenu({ name: "Pizza" } as any);

    expect(result).toEqual(saved);
  });

  test("2. getMenuById populates restaurant", async () => {
    const populate = jest.fn().mockResolvedValue({ _id: "m1" });
    (MenuModel as any).findById.mockReturnValue({ populate });

    const result = await repository.getMenuById("m1");

    expect(result).toEqual({ _id: "m1" });
  });

  test("3. getMenusByRestaurant finds by restaurant id", async () => {
    (MenuModel as any).find.mockResolvedValue([{ _id: "m1" }]);

    const result = await repository.getMenusByRestaurant("r1");

    expect(result).toEqual([{ _id: "m1" }]);
    expect((MenuModel as any).find).toHaveBeenCalledWith({ restaurant: "r1" });
  });

  test("4. getAllMenus populates restaurant", async () => {
    const populate = jest.fn().mockResolvedValue([{ _id: "m1" }]);
    (MenuModel as any).find.mockReturnValue({ populate });

    const result = await repository.getAllMenus();

    expect(result).toEqual([{ _id: "m1" }]);
  });

  test("5. getAllPaginated returns paged menus", async () => {
    (MenuModel as any).countDocuments.mockResolvedValue(2);
    const sort = jest.fn().mockResolvedValue([{ _id: "m1" }]);
    const select = jest.fn().mockReturnValue({ sort });
    const limit = jest.fn().mockReturnValue({ select });
    const skip = jest.fn().mockReturnValue({ limit });
    (MenuModel as any).find.mockReturnValue({ skip });

    const result = await repository.getAllPaginated(1, 10, "pizza");

    expect(result.total).toBe(2);
    expect(result.menus).toEqual([{ _id: "m1" }]);
  });

  test("6. updateMenu updates and returns new document", async () => {
    const updated = { _id: "m1", price: 99 };
    (MenuModel as any).findByIdAndUpdate.mockResolvedValue(updated);

    const result = await repository.updateMenu("m1", { price: 99 } as any);

    expect(result).toEqual(updated);
  });

  test("7. deleteMenu returns boolean", async () => {
    (MenuModel as any).findByIdAndDelete.mockResolvedValue({ _id: "m1" });
    await expect(repository.deleteMenu("m1")).resolves.toBe(true);

    (MenuModel as any).findByIdAndDelete.mockResolvedValue(null);
    await expect(repository.deleteMenu("m2")).resolves.toBe(false);
  });
});
