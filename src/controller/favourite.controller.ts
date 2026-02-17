import { Request, Response } from "express";
import { FavoriteService } from "../services/favourite.service";
const favouriteService = new FavoriteService();

export class FavouriteController {

  async add(req: Request, res: Response) {
    try {
      const customerId = req.user?._id;
      const restaurantId  = req.params.restaurantId as string;

      const favorite = await favouriteService.addToFavorite(
        customerId,
        restaurantId
      );

      return res.status(201).json({
        success: true,
        message: "Added to favorites",
        data: favorite
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const customerId = req.user?._id;
      const restaurantId = req.params.restaurantId as string;

      await favouriteService.removeFromFavorite(
        customerId,
        restaurantId
      );

      return res.status(200).json({
        success: true,
        message: "Removed from favorites"
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMyFavorites(req: Request, res: Response) {
    try {
      const customerId = req.user?._id;

      const favorites = await favouriteService.getMyFavorites(customerId);

      return res.status(200).json({
        success: true,
        data: favorites
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message
      });
    }
  }
}
