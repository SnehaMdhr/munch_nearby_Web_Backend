import z from "zod";
import mongoose from "mongoose";

const booleanFromFormData = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true" || normalized === "1") {
      return true;
    }

    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const menuSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  isAvailable: booleanFromFormData.default(true),
  imageUrl: z.string().optional(),
  restaurant: z.instanceof(mongoose.Types.ObjectId),
});

export type MenuType = z.infer<typeof menuSchema>;
