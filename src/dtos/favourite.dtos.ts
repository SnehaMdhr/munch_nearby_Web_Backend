import z from "zod";

export const CreateFavouriteDTO = z.object({
  restaurantId: z.string()
});

export type CreateFavouriteDTO = z.infer<typeof CreateFavouriteDTO>;
