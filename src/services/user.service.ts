import { CreateUserDto, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dtos"
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import fs from "fs";
import path from "path";
import { OAuth2Client } from "google-auth-library";

const CLIENT_URL = process.env.CLIENT_URL as string;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let userRepository = new UserRepository;

export class UserService {
    async createUser(data:CreateUserDto) {
        //business logic before creating user 

        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403,"Email already in use");
        }
        //hash password 
        const hashedPassword = await bcryptjs.hash(data.password,10); 
        data.password = hashedPassword;

        //create user 
        const newUser = await userRepository.createUser(data);
        return newUser;
    }
    async loginUser(data: LoginUserDTO){
        const user = await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if (!user.password) {
            throw new HttpError(401, "This account uses social login. Please continue with Google.");
        }
        //compare password 
        const validPassword = await bcryptjs.compare(data.password, user.password);
        //plaintext, hashed 
        if(!validPassword){
            throw new HttpError(401,"Invalid credintial");
        }
        
        const payload = {
            id:user._id,
            email: user.email,
            name: user.name,           
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET,{expiresIn:"30d"});
        return {token,user}
    }

    async getUserById(id: string){
        const user = await userRepository.getUsersById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }
    async updateUser(id: string, data: UpdateUserDTO){
        const user = await userRepository.getUsersById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailCheck = await userRepository.getUserByEmail(data.email!);
            if(emailCheck){
                throw new HttpError(403, "Email already in use");
            }
        }
        
        if(data.imageUrl && user.imageUrl && user.imageUrl !== data.imageUrl){
            try {
                const oldImagePath = path.join(__dirname, '../../', user.imageUrl);
    
                if(fs.existsSync(oldImagePath)){
                    fs.unlinkSync(oldImagePath);
                }
            } catch (error) {
                console.error("Error deleting old image:", error);
            }
        }
        
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password,10);
            data.password = hashedPassword;
        }
        const updateUser = await userRepository.updateUser(id, data);
        return updateUser;
    }

    async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password/?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;

        console.log("CLIENT_URL:", CLIENT_URL);
        console.log("RESET LINK:", resetLink);

        await sendEmail(user.email, "Password Reset", html);
        return user;
    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUsersById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            await userRepository.updateUser(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
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

}

