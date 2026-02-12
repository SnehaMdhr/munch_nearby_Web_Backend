import { QueryFilter } from "mongoose";
import mongoose from "mongoose";
import { IRestaurant, RestaurantModel } from "../model/restaurant.model";

export interface IRestaurantRepository {
  createRestaurant(data: Partial<IRestaurant>): Promise<IRestaurant>;

  getRestaurantById(id: string): Promise<IRestaurant | null>;

  getRestaurantByOwner(ownerId: string): Promise<IRestaurant | null>;

  getAllRestaurants(): Promise<IRestaurant[]>;

  getAllPaginated(
    page: number,
    size: number,
    search?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }>;

  updateRestaurant(
    id: string,
    updateData: Partial<IRestaurant>
  ): Promise<IRestaurant | null>;

  deleteRestaurant(id: string): Promise<boolean>;
}

export class RestaurantRepository implements IRestaurantRepository {

  async createRestaurant(
    data: Partial<IRestaurant>
  ): Promise<IRestaurant> {
    const restaurant = new RestaurantModel(data);
    return await restaurant.save();
  }

  async getRestaurantById(
    id: string
  ): Promise<IRestaurant | null> {
    return await RestaurantModel.findById(id)
      .populate("owner", "name email role");
  }

  async getRestaurantByOwner(
    ownerId: string
  ): Promise<IRestaurant | null> {
    return await RestaurantModel.findOne({ owner: ownerId });
  }

  async getAllRestaurants(): Promise<IRestaurant[]> {
    return await RestaurantModel.find()
      .populate("owner", "name email");
  }

  async getAllPaginated(
    page: number,
    size: number,
    search?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }> {

    const query: QueryFilter<IRestaurant> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }

    const total = await RestaurantModel.countDocuments(query);

    const restaurants = await RestaurantModel.find(query)
      .skip((page - 1) * size)
      .limit(size)
      .select("name category address contactNumber createdAt")
      .sort({ createdAt: -1 });

    return { restaurants, total };
  }

  async updateRestaurant(
    id: string,
    updateData: Partial<IRestaurant>
  ): Promise<IRestaurant | null> {

    return await RestaurantModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteRestaurant(id: string): Promise<boolean> {

    const result = await RestaurantModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
