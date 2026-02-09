import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../model/user.model";

declare global {
    namespace Express{
        interface Request {
            user? : Record<string, any> | IUser
        }
    }
}

const userRepository = new UserRepository();
export const authorizedMiddleware = 
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const authHeader = req.headers.authorization;
            if(!authHeader || !authHeader.startsWith("Bearer "))
                throw new HttpError(401, "Unauthorized Token Malformed");
            const token = authHeader.split(" ")[1];
            if(!token) throw new HttpError(401, "Unauthorized Token Missing");
            const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
            if(!decoded || !decoded.id) throw new HttpError(401, "Unauthorized Token Invalid");
            
            const user = await userRepository.getUsersById(decoded.id);
            if(!user) throw new HttpError(401, "Unauthorized User Not Found");
            
            req.user = user; 
            return next();
        }catch(error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );   
        }
}

export const adminOnlyMiddleware = 
async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        if ( !req.user ) {
            throw new HttpError(403,"Forbidden: No user info");
        }
        if ( req.user.role !== "admin" ) {
            throw new HttpError(403, "Forbidden: Admins only" );
        }
        return next();
    } catch (error: any) {
        return res.status(error.statusCode ?? 403).json(
            { success: false, message: error.message || "Forbidden" }
        );
    }
}