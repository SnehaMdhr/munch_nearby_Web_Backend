import { AdminUserService } from "../../services/admin/user.service";
import { NextFunction, Request, Response } from "express";
import { CreateUserDto, UpdateUserDTO } from "../../dtos/user.dtos";
import z from "zod";
let adminUserService = new AdminUserService();
interface QueryParams {
    page?: string;
    size?: string;
    search?: string;
}
export class AdminUserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const parsedData = CreateUserDto.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            if(req.file){   
                parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
            }
            const userData: CreateUserDto = parsedData.data;
            const newUser = await adminUserService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    async getOneUser(req: Request, res: Response){
        try{
            const userId = req.params.id as string; // routes /:id
            const user = await adminUserService.getOneUser(userId);
            return res.status(200).json(
                { success: true, data: user }
            );
        }catch(error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {success: false, message: error.message || "Internal Server Error" }
            );   
        }
    }

    
    async getAllUsers(req: Request, res: Response) {
        try {
            const queryParams = req.query as QueryParams;

            const { users, pagination } = await adminUserService.getAllUsers(
                queryParams.page,
                queryParams.size,
                queryParams.search
            );

            return res.status(200).json({
                success: true,
                data: users,
                pagination
            });
        } catch (error: Error | any) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try{
            const userId = req.params.id as string;
            const isDeleted = await adminUserService.deleteUser(userId);
            if(!isDeleted){
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });
        }catch(error: Error | any){
            return res
                .status(500).json({ 
                    success: false,
                    message: "Internal server error" });
        }
    }

     async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id as string;
            const parsedData = UpdateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            
            if(req.file){   
                parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
            }
            const updateData: UpdateUserDTO = parsedData.data;
            const updatedUser = await adminUserService.updateUser(userId, updateData);
            return res.status(200).json(
                { success: true, message: "User Updated", data: updatedUser }
            );
        }
        catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }


}