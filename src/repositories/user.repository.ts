import { QueryFilter } from "mongoose";
import { UserModel, IUser } from "../model/user.model";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>
    getUsersById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateUser(id:string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id:string): Promise<boolean>;
     getAllPaginated(page: number, size: number, search?: string)
        : Promise<{ users: IUser[]; total: number }>;
}

export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData);
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email });
        return user;
    }
    async getUsersById(id: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"_id":id});
        return user;
    }
    async getAllPaginated(page: number, size: number, search?: string) {
    const query: QueryFilter<IUser> = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const total = await UserModel.countDocuments(query);

    const users = await UserModel.find(query)
        .skip((page - 1) * size)
        .limit(size)
        .select('name email role createdAt') // send only what admin needs
        .sort({ createdAt: -1 });

        return { users, total };
    }

    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, {new:true}
        );
        return updatedUser;
    }
    
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}