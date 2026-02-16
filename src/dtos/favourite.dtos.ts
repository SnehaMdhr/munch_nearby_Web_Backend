import z from "zod";

export const AddFavoriteDTO = z.object({
  restaurantId: z.string().min(1)
});

export type AddFavoriteType = z.infer<typeof AddFavoriteDTO>;
