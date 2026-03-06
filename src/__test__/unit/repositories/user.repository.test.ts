import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../model/user.model";

jest.mock("../../../model/user.model", () => {
  const UserModel = jest.fn();
  (UserModel as any).updateOne = jest.fn();
  (UserModel as any).findOne = jest.fn();
  (UserModel as any).countDocuments = jest.fn();
  (UserModel as any).find = jest.fn();
  (UserModel as any).findByIdAndUpdate = jest.fn();
  (UserModel as any).findByIdAndDelete = jest.fn();
  return { UserModel };
});

describe("UserRepository", () => {
  const repository = new UserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createUser creates and saves user", async () => {
    const savedUser = { _id: "u1", email: "a@mail.com" };
    (UserModel as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedUser),
    }));

    const result = await repository.createUser({ email: "a@mail.com" } as any);

    expect(result).toEqual(savedUser);
  });

  test("2. setResetOtp updates otp fields", async () => {
    await repository.setResetOtp(
      "a@mail.com",
      "123456",
      new Date("2026-01-01"),
    );

    expect((UserModel as any).updateOne).toHaveBeenCalledWith(
      { email: "a@mail.com" },
      { otp: "123456", resetOtpExpiry: new Date("2026-01-01") },
    );
  });

  test("3. updatePasswordByEmail updates password", async () => {
    await repository.updatePasswordByEmail("a@mail.com", "hashed");

    expect((UserModel as any).updateOne).toHaveBeenCalledWith(
      { email: "a@mail.com" },
      { password: "hashed" },
    );
  });

  test("4. clearResetOtp unsets otp fields", async () => {
    await repository.clearResetOtp("a@mail.com");

    expect((UserModel as any).updateOne).toHaveBeenCalledWith(
      { email: "a@mail.com" },
      { $unset: { otp: "", resetOtpExpiry: "" } },
    );
  });

  test("5. getUserByEmail returns matching user", async () => {
    const user = { _id: "u1" };
    (UserModel as any).findOne.mockResolvedValue(user);

    const result = await repository.getUserByEmail("a@mail.com");

    expect(result).toEqual(user);
    expect((UserModel as any).findOne).toHaveBeenCalledWith({
      email: "a@mail.com",
    });
  });

  test("6. getUsersById returns user", async () => {
    const user = { _id: "u1" };
    (UserModel as any).findOne.mockResolvedValue(user);

    const result = await repository.getUsersById("u1");

    expect(result).toEqual(user);
    expect((UserModel as any).findOne).toHaveBeenCalledWith({ _id: "u1" });
  });

  test("7. getAllPaginated returns users and total", async () => {
    (UserModel as any).countDocuments.mockResolvedValue(3);
    const sort = jest.fn().mockResolvedValue([{ _id: "u1" }]);
    const select = jest.fn().mockReturnValue({ sort });
    const limit = jest.fn().mockReturnValue({ select });
    const skip = jest.fn().mockReturnValue({ limit });
    (UserModel as any).find.mockReturnValue({ skip });

    const result = await repository.getAllPaginated(2, 10, "john");

    expect(result.total).toBe(3);
    expect(result.users).toEqual([{ _id: "u1" }]);
    expect((UserModel as any).countDocuments).toHaveBeenCalled();
    expect((UserModel as any).find).toHaveBeenCalled();
    expect(skip).toHaveBeenCalledWith(10);
  });

  test("8. getAllUsers returns all users", async () => {
    (UserModel as any).find.mockResolvedValue([{ _id: "u1" }]);

    const result = await repository.getAllUsers();

    expect(result).toEqual([{ _id: "u1" }]);
  });

  test("9. updateUser calls findByIdAndUpdate", async () => {
    const updated = { _id: "u1", name: "New" };
    (UserModel as any).findByIdAndUpdate.mockResolvedValue(updated);

    const result = await repository.updateUser("u1", { name: "New" } as any);

    expect(result).toEqual(updated);
    expect((UserModel as any).findByIdAndUpdate).toHaveBeenCalledWith(
      "u1",
      { name: "New" },
      { new: true },
    );
  });

  test("10. deleteUser returns boolean", async () => {
    (UserModel as any).findByIdAndDelete.mockResolvedValue({ _id: "u1" });
    await expect(repository.deleteUser("u1")).resolves.toBe(true);

    (UserModel as any).findByIdAndDelete.mockResolvedValue(null);
    await expect(repository.deleteUser("u2")).resolves.toBe(false);
  });
});
