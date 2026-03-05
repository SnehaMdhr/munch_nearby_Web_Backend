import { AdminUserService } from "../../../services/admin/user.service";
import { HttpError } from "../../../errors/http-error";
import bcryptjs from "bcryptjs";

jest.mock("../../../repositories/user.repository", () => {
  const mockUserRepository = {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getAllPaginated: jest.fn(),
    getUsersById: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
  };

  return {
    UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
    mockUserRepository,
  };
});

jest.mock("bcryptjs", () => ({ hash: jest.fn() }));

const { mockUserRepository } = jest.requireMock(
  "../../../repositories/user.repository",
);

describe("AdminUserService", () => {
  const service = new AdminUserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createUser throws when email exists", async () => {
    mockUserRepository.getUserByEmail.mockResolvedValue({ _id: "u1" });

    await expect(
      service.createUser({ email: "a@mail.com" } as any),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("2. createUser hashes and creates", async () => {
    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashed");
    mockUserRepository.createUser.mockResolvedValue({ _id: "u1" });

    const result = await service.createUser({
      email: "a@mail.com",
      password: "pass",
    } as any);

    expect(result).toEqual({ _id: "u1" });
  });

  test("3. getAllUsers returns pagination", async () => {
    mockUserRepository.getAllPaginated.mockResolvedValue({
      users: [{ _id: "u1" }],
      total: 21,
    });

    const result = await service.getAllUsers("2", "10", "john");

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(3);
  });

  test("4. getOneUser throws when missing", async () => {
    mockUserRepository.getUsersById.mockResolvedValue(null);

    await expect(service.getOneUser("u1")).rejects.toBeInstanceOf(HttpError);
  });

  test("5. deleteUser delegates to repository", async () => {
    mockUserRepository.getUsersById.mockResolvedValue({
      _id: "u1",
      imageUrl: undefined,
    });
    mockUserRepository.deleteUser.mockResolvedValue(true);

    await expect(service.deleteUser("u1")).resolves.toBe(true);
  });

  test("6. updateUser throws when user not found", async () => {
    mockUserRepository.getUsersById.mockResolvedValue(null);

    await expect(
      service.updateUser("u1", { name: "x" } as any),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("7. updateUser delegates to repository", async () => {
    mockUserRepository.getUsersById.mockResolvedValue({
      _id: "u1",
      imageUrl: undefined,
    });
    mockUserRepository.updateUser.mockResolvedValue({ _id: "u1", name: "new" });

    await expect(
      service.updateUser("u1", { name: "new" } as any),
    ).resolves.toEqual({ _id: "u1", name: "new" });
  });
});
