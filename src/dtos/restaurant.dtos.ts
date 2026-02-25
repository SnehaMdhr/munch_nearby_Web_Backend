import z from "zod";
import { restaurantSchema } from "../types/restaurant.type";


// Create Restaurant DTO (Profile Section)
export const CreateRestaurantDTO = restaurantSchema.omit({
  owner: true,
  totalReviews: true,
  averageReviews: true,
  menus: true,
  reviews: true
});

export type CreateRestaurantDTO = z.infer<typeof CreateRestaurantDTO>;


// Update Restaurant DTO
export const UpdateRestaurantDTO = restaurantSchema
  .omit({
    owner: true,
    totalReviews: true,
    averageReviews: true,
    menus: true,
    reviews: true
  })
  .partial();

export type UpdateRestaurantDTO = z.infer<typeof UpdateRestaurantDTO>;
