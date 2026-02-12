import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { CreateRestaurantDTO, UpdateRestaurantDTO } from "../dtos/restaurant.dtos";

const restaurantRepository = new RestaurantRepository();

export class RestaurantService {

  // ✅ Create Restaurant (1 Owner = 1 Restaurant)
  async createRestaurant(ownerId: string, data: CreateRestaurantDTO) {

    // Check if owner already has a restaurant
    const existingRestaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (existingRestaurant) {
      throw new HttpError(403, "You have already created a restaurant");
    }

    try {
      const newRestaurant = await restaurantRepository.createRestaurant({
        ...data,
        owner: new mongoose.Types.ObjectId(ownerId)
      });

      return newRestaurant;

    } catch (error: any) {

      // Extra protection for duplicate index error
      if (error.code === 11000) {
        throw new HttpError(400, "Restaurant already exists for this owner");
      }

      throw error;
    }
  }


  // ✅ Get Restaurant for Profile (Owner View)
  async getRestaurantByOwner(ownerId: string) {

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    return restaurant;
  }


  // ✅ Get Restaurant By ID (Public View)
  async getRestaurantById(id: string) {

    const restaurant = await restaurantRepository.getRestaurantById(id);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    return restaurant;
  }


  // ✅ Get All Restaurants (Homepage)
  async getAllRestaurants() {

    return await restaurantRepository.getAllRestaurants();
  }


  // ✅ Get All Restaurants Paginated (Admin Panel)
  async getAllPaginated(page: number, size: number, search?: string) {

    return await restaurantRepository.getAllPaginated(page, size, search);
  }


  // ✅ Update Restaurant (Owner Only)
  async updateRestaurant(ownerId: string, data: UpdateRestaurantDTO) {

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    const updatedRestaurant = await restaurantRepository.updateRestaurant(
      restaurant._id.toString(),
      data
    );

    return updatedRestaurant;
  }


  // ✅ Delete Restaurant (Owner Only)
  async deleteRestaurant(ownerId: string) {

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    const deleted = await restaurantRepository.deleteRestaurant(
      restaurant._id.toString()
    );

    return deleted;
  }
}
