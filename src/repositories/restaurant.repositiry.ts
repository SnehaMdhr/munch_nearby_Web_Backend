import { QueryFilter } from "mongoose";
import mongoose from "mongoose";
import { IRestaurant, RestaurantModel } from "../model/restaurant.model";
import { RestaurantStatus } from "../types/restaurant.type";

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

  updateStatus(id: string,status: RestaurantStatus): Promise<IRestaurant | null>;

  softDeleteByAdmin(id: string): Promise<boolean>;
  
}

export class RestaurantRepository implements IRestaurantRepository {
  async updateStatus(id: string, status: RestaurantStatus): Promise<IRestaurant | null> {
    return await RestaurantModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
  async softDeleteByAdmin(id: string): Promise<boolean> {
    const result = await RestaurantModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    return result ? true: false;
  }
  
  async createRestaurant(
    data: Partial<IRestaurant>
  ): Promise<IRestaurant> {
    const restaurant = new RestaurantModel(data);
    return await restaurant.save();
  }

  async getRestaurantById(
    id: string
  ): Promise<IRestaurant | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await RestaurantModel.findOne({ _id: id, isDeleted: false })
      .populate("owner", "name email role");
  }

async getRestaurantByOwner(
  ownerId: string
): Promise<IRestaurant | null> {
  return await RestaurantModel.findOne({ owner: ownerId, isDeleted: false })
    .populate("owner", "name")
    .populate("menus")   // Matches the field name in your Restaurant schema
    .populate("reviews")
    .exec();
}
  async getAllRestaurants(): Promise<IRestaurant[]> {
    return await RestaurantModel.find({
      isDeleted: false,
      status: RestaurantStatus.APPROVED
    })
      .populate("owner", "name email");
  }

  async getAllPaginated(
    page: number,
    size: number,
    search?: string
  ): Promise<{ restaurants: IRestaurant[]; total: number }> {

    const query: QueryFilter<IRestaurant> = { isDeleted: false };

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
      .select("name category address contactNumber totalReviews averageReviews createdAt owner")
      .populate("owner", "name", "imageUrl")
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
