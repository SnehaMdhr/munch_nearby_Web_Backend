import { CreateUserDto, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dtos";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import { OAuth2Client } from "google-auth-library";
import { deleteUploadIfExists } from "../utils/upload-path";

const CLIENT_URL = process.env.CLIENT_URL as string;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDto) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);
    return newUser;
  }
  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    if (!user.password) {
      throw new HttpError(
        401,
        "This account uses social login. Please continue with Google.",
      );
    }
    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credential");
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user };
  }

  async getUserById(id: string) {
    const user = await userRepository.getUsersById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }
  async updateUser(id: string, data: UpdateUserDTO) {
    const user = await userRepository.getUsersById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    if (user.email !== data.email) {
      const emailCheck = await userRepository.getUserByEmail(data.email!);
      if (emailCheck) {
        throw new HttpError(403, "Email already in use");
      }
    }

    if (data.imageUrl && user.imageUrl && user.imageUrl !== data.imageUrl) {
      try {
        deleteUploadIfExists(user.imageUrl);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    if (data.password) {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }
    const updateUser = await userRepository.updateUser(id, data);
    return updateUser;
  }
  async sendResetPasswordEmailOTP(email?: string) {
    if (!email) {
      throw new HttpError(400, "Email is required");
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (user.otp && user.resetOtpExpiry && user.resetOtpExpiry > new Date()) {
      return { message: "OTP already sent. Please check your email." };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.setResetOtp(email, otp, expiry);

    const html = `<p>Your OTP for password reset is:</p>
                  <h2>${otp}</h2>
                  <p>This OTP will expire in 10 minutes.</p>`;

    await sendEmail(user.email, "Password Reset OTP", html);

    return { message: "OTP sent successfully" };
  }

  async resetPasswordOTP(email?: string, otp?: string, newPassword?: string) {
    if (!email || !otp || !newPassword) {
      throw new HttpError(400, "Email, OTP and new password are required");
    }

    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.otp || !user.resetOtpExpiry) {
      throw new HttpError(400, "OTP not requested");
    }

    if (user.otp !== otp) {
      throw new HttpError(400, "Invalid OTP");
    }

    if (user.resetOtpExpiry < new Date()) {
      throw new HttpError(400, "OTP expired");
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await userRepository.updatePasswordByEmail(email, hashedPassword);

    await userRepository.clearResetOtp(email);

    return { message: "Password reset successful" };
  }

  async googleLogin(token: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new HttpError(400, "Invalid Google token");
    }

    const { email, name, picture } = payload;

    let user = await userRepository.getUserByEmail(email);

    if (!user) {
      user = await userRepository.createUser({
        email,
        name,
        authProvider: "google",
        role: "Customer",
        imageUrl: picture,
      });
    }

    const payloadJwt = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const jwtToken = jwt.sign(payloadJwt, JWT_SECRET, { expiresIn: "30d" });

    return { token: jwtToken, user };
  }

  async changePassword(
    userId: string,
    oldPassword?: string,
    newPassword?: string,
  ) {
    if (!oldPassword || !newPassword) {
      throw new HttpError(400, "Old password and new password are required");
    }

    const user = await userRepository.getUsersById(userId);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.password) {
      throw new HttpError(400, "This account uses social login");
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new HttpError(400, "Old password is incorrect");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await userRepository.updateUser(userId, {
      password: hashedPassword,
    });

    return { message: "Password changed successfully" };
  }
}
