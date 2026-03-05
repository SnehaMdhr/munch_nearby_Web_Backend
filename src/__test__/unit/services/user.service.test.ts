import { UserService } from "../../../services/user.service";
import { HttpError } from "../../../errors/http-error";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../config/email";

jest.mock("../../../repositories/user.repository", () => {
  const mockUserRepository = {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUsersById: jest.fn(),
    updateUser: jest.fn(),
    setResetOtp: jest.fn(),
    updatePasswordByEmail: jest.fn(),
    clearResetOtp: jest.fn(),
  };

  return {
    UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
    mockUserRepository,
  };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("google-auth-library", () => {
  const mockVerifyIdToken = jest.fn();

  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
    mockVerifyIdToken,
  };
});

const { mockUserRepository } = jest.requireMock(
  "../../../repositories/user.repository",
);
const { mockVerifyIdToken } = jest.requireMock("google-auth-library");

describe("UserService", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. createUser throws when email already used", async () => {
    mockUserRepository.getUserByEmail.mockResolvedValue({ _id: "u1" });

    await expect(
      service.createUser({ email: "a@mail.com" } as any),
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("2. createUser hashes password and creates", async () => {
    mockUserRepository.getUserByEmail.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashed");
    mockUserRepository.createUser.mockResolvedValue({ _id: "u1" });

    const result = await service.createUser({
      email: "a@mail.com",
      password: "pass",
    } as any);

    expect(result).toEqual({ _id: "u1" });
    expect(bcryptjs.hash).toHaveBeenCalledWith("pass", 10);
  });

  test("3. loginUser validates user and password", async () => {
    mockUserRepository.getUserByEmail.mockResolvedValue({
      _id: "u1",
      email: "a@mail.com",
      name: "A",
      role: "Customer",
      password: "hash",
    });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

    const result = await service.loginUser({
      email: "a@mail.com",
      password: "pass",
    });

    expect(result.token).toBe("jwt-token");
  });

  test("4. getUserById throws when not found", async () => {
    mockUserRepository.getUsersById.mockResolvedValue(null);

    await expect(service.getUserById("u1")).rejects.toBeInstanceOf(HttpError);
  });

  test("5. updateUser hashes new password", async () => {
    mockUserRepository.getUsersById.mockResolvedValue({
      _id: "u1",
      email: "a@mail.com",
    });
    (bcryptjs.hash as jest.Mock).mockResolvedValue("new-hash");
    mockUserRepository.updateUser.mockResolvedValue({ _id: "u1" });

    await service.updateUser("u1", {
      email: "a@mail.com",
      password: "new",
    } as any);

    expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ password: "new-hash" }),
    );
  });

  test("6. sendResetPasswordEmailOTP sends mail", async () => {
    mockUserRepository.getUserByEmail.mockResolvedValue({
      email: "a@mail.com",
    });

    const result = await service.sendResetPasswordEmailOTP("a@mail.com");

    expect(result.message).toContain("OTP");
    expect(mockUserRepository.setResetOtp).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
  });

  test("7. resetPasswordOTP validates and updates", async () => {
    const future = new Date(Date.now() + 600000);
    mockUserRepository.getUserByEmail.mockResolvedValue({
      email: "a@mail.com",
      otp: "123456",
      resetOtpExpiry: future,
    });
    (bcryptjs.hash as jest.Mock).mockResolvedValue("new-hash");

    const result = await service.resetPasswordOTP(
      "a@mail.com",
      "123456",
      "newpass",
    );

    expect(result.message).toContain("successful");
    expect(mockUserRepository.updatePasswordByEmail).toHaveBeenCalled();
    expect(mockUserRepository.clearResetOtp).toHaveBeenCalled();
  });

  test("8. googleLogin creates missing user and returns jwt", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: "g@mail.com",
        name: "Google",
        picture: "pic",
      }),
    });
    mockUserRepository.getUserByEmail
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        _id: "u1",
        email: "g@mail.com",
        name: "Google",
        role: "Customer",
      });
    mockUserRepository.createUser.mockResolvedValue({
      _id: "u1",
      email: "g@mail.com",
      name: "Google",
      role: "Customer",
    });
    (jwt.sign as jest.Mock).mockReturnValue("jwt-google");

    const result = await service.googleLogin("google-token");

    expect(result.token).toBe("jwt-google");
  });

  test("9. changePassword validates old password then updates", async () => {
    mockUserRepository.getUsersById.mockResolvedValue({
      _id: "u1",
      password: "old-hash",
    });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("new-hash");
    mockUserRepository.updateUser.mockResolvedValue({ _id: "u1" });

    const result = await service.changePassword("u1", "old", "new");

    expect(result.message).toContain("changed");
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith("u1", {
      password: "new-hash",
    });
  });
});
