import z from "zod";
import { menuSchema } from "../types/menu.type";


// ✅ Create Menu DTO
export const CreateMenuDTO = menuSchema.omit({
  restaurant: true
});

export type CreateMenuDTO = z.infer<typeof CreateMenuDTO>;


// ✅ Update Menu DTO
export const UpdateMenuDTO = menuSchema
  .omit({
    restaurant: true
  })
  .partial();

export type UpdateMenuDTO = z.infer<typeof UpdateMenuDTO>;
