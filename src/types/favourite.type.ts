
import z from "zod";
import mongoose from "mongoose";

export const favouriteSchema = z.object({
  customer: mongoose.Types.ObjectId,
  restaurant: mongoose.Types.ObjectId,
});

export type FavouriteType = z.infer<typeof favouriteSchema>;
