import z from "zod";
import mongoose from "mongoose";

export enum RestaurantStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED"
}

export const restaurantSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  mapLink: z.string().url().optional(),
  contactNumber: z.string().min(5),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),

  openingHours: z
    .array(
      z.object({
        day: z.string().min(2),
        open: z.string().min(3),
        close: z.string().min(3),
        isClosed: z.boolean().default(false)
      })
    )
    .default([]),

  totalReviews: z.coerce.number().int().min(0).default(0),
  averageReviews: z.coerce.number().min(0).max(5).default(0),

  menus: z.array(z.instanceof(mongoose.Types.ObjectId)).default([]),
  reviews: z.array(z.instanceof(mongoose.Types.ObjectId)).default([]),


  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]) // [longitude, latitude]
    })
    .optional(),


  // Reference to User
  owner: z.instanceof(mongoose.Types.ObjectId),

  status: z.nativeEnum(RestaurantStatus).default(RestaurantStatus.PENDING),
  isDeleted: z.boolean().default(false),
});

export type RestaurantType = z.infer<typeof restaurantSchema>;
