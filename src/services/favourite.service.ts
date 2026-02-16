import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { FavoriteRepository } from "../repositories/favourite.repository";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { FavoriteModel } from "../model/favourite.model";

const favoriteRepository = new FavoriteRepository();
const restaurantRepository = new RestaurantRepository();

export class FavoriteService {

  async addToFavorite(customerId: string, restaurantId: string) {

    const restaurant = await restaurantRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    const exists = await favoriteRepository.find(customerId, restaurantId);

    if (exists) {
      throw new HttpError(400, "Restaurant already in favorites");
    }

    const favorite = await FavoriteModel.create({
      customer: new mongoose.Types.ObjectId(customerId),
      restaurant: new mongoose.Types.ObjectId(restaurantId)
    });
  }

  async removeFromFavorite(customerId: string, restaurantId: string) {

    const removed = await favoriteRepository.delete(customerId, restaurantId);

    if (!removed) {
      throw new HttpError(404, "Favorite not found");
    }

    return true;
  }

  async getMyFavorites(customerId: string) {
    return await favoriteRepository.findByCustomer(customerId);
  }
}
