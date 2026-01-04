import { UserService } from "../services/user.service";
import { CreateUserDto, LoginUserDTO } from "../dtos/user.dtos";
import { Request, Response } from "express";
import z, { success } from "zod";

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
}