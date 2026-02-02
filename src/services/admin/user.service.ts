import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs"
import { CreateUserDto } from "../../dtos/user.dtos";
import { HttpError } from "../../errors/http-error";
let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(data: CreateUserDto){
        // same as src/services/user.service.ts
    }
    async getAllUsers(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSize = size ? parseInt(size, 10) : 10;

    const { users, total } = await userRepository.getAllPaginated(
        pageNumber,
        pageSize,
        search
    );

    const pagination = {
        page: pageNumber,
        size: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    };

    return { users, pagination };
}
    async getOneUser(id: string){
        const user = await userRepository.getUsersById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }
    // continue all
}