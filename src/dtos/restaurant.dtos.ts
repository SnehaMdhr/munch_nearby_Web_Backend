import z from "zod";
import { restaurantSchema } from "../types/restaurant.type";


// Create Restaurant DTO (Profile Section)
export const CreateRestaurantDTO = restaurantSchema.omit({
  owner: true
});

export type CreateRestaurantDTO = z.infer<typeof CreateRestaurantDTO>;


// Update Restaurant DTO
export const UpdateRestaurantDTO = restaurantSchema
  .omit({
    owner: true
  })
  .partial();

export type UpdateRestaurantDTO = z.infer<typeof UpdateRestaurantDTO>;
