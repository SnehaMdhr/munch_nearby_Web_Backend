import z from "zod";
import { reviewSchema } from "../types/review.type";

export const CreateReviewDTO = z.object({
  restaurantId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;
