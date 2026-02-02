import { AdminUserService } from "../../services/admin/user.service";
import { Request, Response } from "express";
import z from "zod";
let adminUserService = new AdminUserService();
interface QueryParams {
    page?: string;
    size?: string;
    search?: string;
}
export class AdminUserController {
    async createUser(req: Request, res: Response){
        // can be same as AuthController.register
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


}