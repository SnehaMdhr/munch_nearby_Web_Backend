import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { FavouriteRepository } from "../repositories/favourite.repository";
import { FavouriteModel } from "../model/favourite.model";


const favouriteRepository = new FavouriteRepository();
const restaurantRepository = new RestaurantRepository();

export class FavoriteService {

  async addToFavorite(customerId: string, restaurantId: string) {

    const restaurant = await restaurantRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    const exists = await favouriteRepository.find(customerId, restaurantId);

    if (exists) {
      throw new HttpError(400, "Restaurant already in favorites");
    }

    const favourite = await FavouriteModel.create({
      customer: new mongoose.Types.ObjectId(customerId),
      restaurant: new mongoose.Types.ObjectId(restaurantId)
    });
  }

  async removeFromFavorite(customerId: string, restaurantId: string) {

    const removed = await favouriteRepository.delete(customerId, restaurantId);

    if (!removed) {
      throw new HttpError(404, "Favorite not found");
    }

    return true;
  }

  async getMyFavorites(customerId: string) {
    return await favouriteRepository.findByCustomer(customerId);
  }
}
