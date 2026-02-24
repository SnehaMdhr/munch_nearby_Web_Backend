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

const restaurantRepository = new RestaurantRepository();

export class RestaurantService {

  // ✅ Create Restaurant (1 Owner = 1 Restaurant)
  async createRestaurant(ownerId: string, data: CreateRestaurantDTO) {

  // 1️⃣ Check if owner already has a restaurant
  const existingRestaurant =
    await restaurantRepository.getRestaurantByOwner(ownerId);

  if (existingRestaurant) {
    throw new HttpError(403, "You have already created a restaurant");
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  // 2️⃣ Try extracting coordinates from Google Maps link
  if (data.mapLink) {
    const extracted = extractLatLng(data.mapLink);

    if (extracted) {
      latitude = extracted.latitude;
      longitude = extracted.longitude;
    }
  }

  // 3️⃣ If extraction fails → geocode using OpenStreetMap
  if (latitude === null || longitude === null) {
    const geocoded = await geocodeAddress(data.address);

    if (!geocoded) {
      throw new HttpError(400, "Unable to determine restaurant location");
    }

    latitude = geocoded.latitude;
    longitude = geocoded.longitude;
  }

  // 4️⃣ Create GeoJSON location (Mongo format)
  const location = {
    type: "Point" as const,
    coordinates: [longitude, latitude] as [number, number], // ⚠ Mongo uses [lng, lat]
  };

  // 5️⃣ Save to database
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


  async updateRestaurant(ownerId: string, data: UpdateRestaurantDTO) {

  const restaurant =
    await restaurantRepository.getRestaurantByOwner(ownerId);

  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  let updatedData: any = { ...data };

  // 🔥 Handle old image deletion if new image is being uploaded
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
  // ✅ Delete Restaurant (Owner Only) - Cascade delete all related data
  async deleteRestaurant(ownerId: string) {

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    const restaurantId = restaurant._id.toString();

    // 🔥 Delete restaurant image if exists
    if(restaurant.imageUrl){
      try {
        const imagePath = path.join(__dirname, '../../', restaurant.imageUrl);
        
        if(fs.existsSync(imagePath)){
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error deleting restaurant image:", error);
      }
    }

    // 🔥 Delete all related data in parallel
    await Promise.all([
      ReviewModel.deleteMany({ restaurant: restaurantId }),
      MenuModel.deleteMany({ restaurant: restaurantId }),
      FavouriteModel.deleteMany({ restaurant: restaurantId })
    ]);

    // 🔥 Finally, delete the restaurant itself
    const deleted = await restaurantRepository.deleteRestaurant(restaurantId);

    return deleted;
  }
}
