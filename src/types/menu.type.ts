import z from "zod";
import mongoose from "mongoose";

export const menuSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string().min(2),
  isAvailable: z.boolean().default(true),
  restaurant: z.instanceof(mongoose.Types.ObjectId)
});

export type MenuType = z.infer<typeof menuSchema>;
