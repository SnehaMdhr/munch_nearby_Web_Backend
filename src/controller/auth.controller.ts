import { UserService } from "../services/user.service";
import { CreateUserDto, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dtos";
import { Request, Response } from "express";
import z, { success } from "zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

let userService = new UserService();

export class AuthController{
    async register (req: Request, res: Response){
        try{
            const parsedData = CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            const userData: CreateUserDto = parsedData.data;
            const newUser = await userService.createUser(userData);
            return res.status(201).json(
                {success:true, message:"Registration Successful", data: newUser}
            );
        }catch(error: Error | any){
            return res.status(error.statuCode ?? 500).json(
                {success:false, message: error.message || "Internal Server Error"}
            );

        }
    }
    async login(req: Request, res:Response){
        try{
            const parsedData = LoginUserDTO.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success:false, message: z.prettifyError(parsedData.error)}
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const{token, user} = await userService.loginUser(loginData);
            return res.status(200).json(
                {success: true, messaage:"Login successful", data:user, token}
            );
        }catch(error: Error | any){
            return res.status(error.statuCode ?? 500).json(
                {success:false, message: error.message || "Internal Server Error"}
            );

        }
    }

    async getUserById(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            
            if(!userId){
                return res.status(400).json(
                    {success: false, message: "User Id not provided"}
                );
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                {success: true, message:"user fetched successfully", data: user}
            );
        }catch(error: Error | any){
            return res.status(error.statuCode??500).json(
                {success: false, message: error.messaage ||"internal Server error"}
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try{
            const userId = req.user?._id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User ID not provided" }
                );
            }
            let parsedData = UpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            if(req.file){ // if file is being uploaded
                parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, message: "User updated successfully", data: updatedUser }
            );
        }catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async requestPasswordReset(req: Request, res: Response) {
        try {
            const email = req.body.email;
            if (!email) {
                return res.status(400).json(
                    { success: false, message: "Email is required" }
                );
            }
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                {
                    success: true,
                    data: user,
                    message: "Password reset email sent"
                }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {

           const token = req.params.token as string;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}