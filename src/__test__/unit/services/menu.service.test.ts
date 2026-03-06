import { MenuService } from "../../../services/menu.service";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repositories/menu.repository", () => {
  const mockMenuRepository = {
    createMenu: jest.fn(),
    getMenuById: jest.fn(),
    getMenusByRestaurant: jest.fn(),
    getAllMenus: jest.fn(),
    updateMenu: jest.fn(),
    deleteMenu: jest.fn(),
  };

  return {
    MenuRepository: jest.fn().mockImplementation(() => mockMenuRepository),
    mockMenuRepository,
  };
});

jest.mock("../../../repositories/restaurant.repositiry", () => {
  const mockRestaurantRepository = {
    getRestaurantByOwner: jest.fn(),
    getRestaurantById: jest.fn(),
  };

  return {
    RestaurantRepository: jest
      .fn()
      .mockImplementation(() => mockRestaurantRepository),
    mockRestaurantRepository,
  };
});

const { mockMenuRepository } = jest.requireMock(
  "../../../repositories/menu.repository",
);
const { mockRestaurantRepository } = jest.requireMock(
  "../../../repositories/restaurant.repositiry",
);

describe("MenuService", () => {
  const service = new MenuService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createMenu throws if restaurant missing", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue(null);

    await expect(
      service.createMenu("owner1", { name: "Pizza" } as any),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("2. createMenu creates menu with owner restaurant id", async () => {
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue({
      _id: "r1",
    });
    mockMenuRepository.createMenu.mockResolvedValue({ _id: "m1" });

    const result = await service.createMenu("owner1", {
      name: "Pizza",
      price: 10,
      category: "Fast",
    } as any);

    expect(result).toEqual({ _id: "m1" });
    expect(mockMenuRepository.createMenu).toHaveBeenCalledWith(
      expect.objectContaining({ restaurant: "r1" }),
    );
  });

  test("3. getMenuById throws when not found", async () => {
    mockMenuRepository.getMenuById.mockResolvedValue(null);

    await expect(service.getMenuById("m1")).rejects.toBeInstanceOf(HttpError);
  });

  test("4. getMenusByRestaurant validates restaurant", async () => {
    mockRestaurantRepository.getRestaurantById.mockResolvedValue(null);

    await expect(service.getMenusByRestaurant("r1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("5. getAllMenus returns menus", async () => {
    mockMenuRepository.getAllMenus.mockResolvedValue([{ _id: "m1" }]);

    await expect(service.getAllMenus()).resolves.toEqual([{ _id: "m1" }]);
  });

  test("6. updateMenu enforces ownership and updates", async () => {
    mockMenuRepository.getMenuById.mockResolvedValue({
      _id: "m1",
      restaurant: { equals: jest.fn().mockReturnValue(true) },
      imageUrl: undefined,
    });
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue({
      _id: "r1",
    });
    mockMenuRepository.updateMenu.mockResolvedValue({ _id: "m1", price: 20 });

    const result = await service.updateMenu("owner1", "m1", {
      price: 20,
    } as any);

    expect(result).toEqual({ _id: "m1", price: 20 });
  });

  test("7. deleteMenu throws on unauthorized owner", async () => {
    mockMenuRepository.getMenuById.mockResolvedValue({
      _id: "m1",
      restaurant: { equals: jest.fn().mockReturnValue(false) },
    });
    mockRestaurantRepository.getRestaurantByOwner.mockResolvedValue({
      _id: "r1",
    });

    await expect(service.deleteMenu("owner1", "m1")).rejects.toBeInstanceOf(
      HttpError,
    );
  });

  test("8. adminDeleteMenu deletes existing menu", async () => {
    mockMenuRepository.getMenuById.mockResolvedValue({
      _id: "m1",
      imageUrl: undefined,
    });
    mockMenuRepository.deleteMenu.mockResolvedValue(true);

    await expect(service.adminDeleteMenu("m1")).resolves.toBe(true);
  });
});
