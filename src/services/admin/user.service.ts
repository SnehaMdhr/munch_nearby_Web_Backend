import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs"
import { CreateUserDto, UpdateUserDTO } from "../../dtos/user.dtos";
import { HttpError } from "../../errors/http-error";
let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(data: CreateUserDto){
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        const newUser = await userRepository.createUser(data);
        return newUser;
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
    async deleteUser(id: string) {
        const isDeleted = await userRepository.deleteUser(id);
        return isDeleted;
    }
    async updateUser(id: string, updateData: UpdateUserDTO){
        const user = await userRepository.getUsersById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const updatedUser = await userRepository.updateUser(id, updateData);
        return updatedUser;
    }
}