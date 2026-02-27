import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { CreateRestaurantDTO, UpdateRestaurantDTO } from "../dtos/restaurant.dtos";
import { extractLatLng } from "../utils/extractLatLng";
import { geocodeAddress } from "../utils/geocode";
import { ReviewModel } from "../model/review.model";
import { MenuModel } from "../model/menu.model";
import { FavouriteModel } from "../model/favourite.model";
import fs from "fs";
import path from "path";
import { RestaurantStatus } from "../types/restaurant.type";
import { RestaurantModel } from "../model/restaurant.model";

const restaurantRepository = new RestaurantRepository();

export class RestaurantService {

  private async cascadeDeleteRestaurant(restaurantId: string) {
    const restaurant = await RestaurantModel.findById(restaurantId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    if (restaurant.imageUrl) {
      try {
        const imagePath = path.join(__dirname, '../../', restaurant.imageUrl);

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error deleting restaurant image:", error);
      }
    }

    await Promise.all([
      ReviewModel.deleteMany({ restaurant: restaurantId }),
      MenuModel.deleteMany({ restaurant: restaurantId }),
      FavouriteModel.deleteMany({ restaurant: restaurantId })
    ]);

    await restaurantRepository.deleteRestaurant(restaurantId);
  }


  async createRestaurant(ownerId: string, data: CreateRestaurantDTO) {

  const existingRestaurant =
    await restaurantRepository.getRestaurantByOwner(ownerId);

  if (existingRestaurant) {
    throw new HttpError(403, "You have already created a restaurant");
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  if (data.mapLink) {
    const extracted = extractLatLng(data.mapLink);

    if (extracted) {
      latitude = extracted.latitude;
      longitude = extracted.longitude;
    }
  }

  if (latitude === null || longitude === null) {
    const geocoded = await geocodeAddress(data.address);

    if (!geocoded) {
      throw new HttpError(400, "Unable to determine restaurant location");
    }

    latitude = geocoded.latitude;
    longitude = geocoded.longitude;
  }

  const location = {
    type: "Point" as const,
    coordinates: [longitude, latitude] as [number, number], // ⚠ Mongo uses [lng, lat]
  };

  try {
    const newRestaurant =
      await restaurantRepository.createRestaurant({
        ...data,
        location,
        owner: new mongoose.Types.ObjectId(ownerId),
      });

    return newRestaurant;

  } catch (error: any) {

    if (error.code === 11000) {
      throw new HttpError(400, "Restaurant already exists for this owner");
    }

    throw error;
  }
}

  async getRestaurantByOwner(ownerId: string) {

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    return restaurant;
  }

  async getRestaurantById(id: string) {

    const restaurant = await restaurantRepository.getRestaurantById(id);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    return restaurant;
  }

  async getAllRestaurants() {

    return await restaurantRepository.getAllRestaurants();
  }

  async getAllPaginated(page: number, size: number, search?: string) {

    return await restaurantRepository.getAllPaginated(page, size, search);
  }


  async updateRestaurant(ownerId: string, data: UpdateRestaurantDTO) {

  const restaurant =
    await restaurantRepository.getRestaurantByOwner(ownerId);

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  let updatedData: any = { ...data };

  if(data.imageUrl && restaurant.imageUrl && restaurant.imageUrl !== data.imageUrl){
    try {
      const oldImagePath = path.join(__dirname, '../../', restaurant.imageUrl);
      
      if(fs.existsSync(oldImagePath)){
        fs.unlinkSync(oldImagePath);
      }
    } catch (error) {
      console.error("Error deleting old restaurant image:", error);
    }
  }

  if (data.mapLink) {
    const coords = extractLatLng(data.mapLink);

    if (!coords) {
      throw new HttpError(400, "Invalid Google Maps link format");
    }

    updatedData.location = {
      type: "Point",
      coordinates: [coords.longitude, coords.latitude]
    };
  }

  return await restaurantRepository.updateRestaurant(
    restaurant._id.toString(),
    updatedData
  );
}
  async deleteRestaurant(ownerId: string) {

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    const restaurantId = restaurant._id.toString();

    await this.cascadeDeleteRestaurant(restaurantId);

    return true;
  }

async approveRestaurant(restaurantId: string) {

  const restaurant =
    await restaurantRepository.updateStatus(
      restaurantId,
      RestaurantStatus.APPROVED
    );

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  return restaurant;
}

async rejectRestaurant(restaurantId: string) {

  const restaurant =
    await restaurantRepository.updateStatus(
      restaurantId,
      RestaurantStatus.REJECTED
    );

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  return restaurant;
}

async suspendRestaurant(restaurantId: string) {

  const restaurant =
    await restaurantRepository.updateStatus(
      restaurantId,
      RestaurantStatus.SUSPENDED
    );

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  return restaurant;
}

async deleteRestaurantByAdmin(restaurantId: string) {
  await this.cascadeDeleteRestaurant(restaurantId);

  return true;
}

async getAllRestaurantsForAdmin() {
  return await RestaurantModel.find({ isDeleted: false })
    .populate("owner", "name email role")
    .sort({ createdAt: -1 });
}


  
}
