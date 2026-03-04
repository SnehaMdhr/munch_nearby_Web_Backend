import z from "zod";
import { menuSchema } from "../types/menu.type";

export const CreateMenuDTO = menuSchema.omit({
  restaurant: true,
});

export type CreateMenuDTO = z.infer<typeof CreateMenuDTO>;

export const UpdateMenuDTO = menuSchema
  .omit({
    restaurant: true,
  })
  .partial();

export type UpdateMenuDTO = z.infer<typeof UpdateMenuDTO>;
