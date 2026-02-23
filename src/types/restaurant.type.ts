import z from "zod";
import mongoose from "mongoose";

export const restaurantSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  mapLink: z.string().url().optional(),
  contactNumber: z.string().min(5),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),

  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]) // [longitude, latitude]
    })
    .optional(),


  // Reference to User
  owner: z.instanceof(mongoose.Types.ObjectId)
});

export type RestaurantType = z.infer<typeof restaurantSchema>;
