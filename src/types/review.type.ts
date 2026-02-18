import { z } from "zod";
import mongoose from "mongoose";

export const reviewSchema = z.object({
  customer: mongoose.Types.ObjectId,
  restaurant: mongoose.Types.ObjectId,
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export type ReviewType = z.infer<typeof reviewSchema>;
