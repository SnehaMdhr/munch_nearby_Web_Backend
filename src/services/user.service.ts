import { CreateUserDto, LoginUserDTO } from "../dtos/user.dtos"
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

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

}

