import { Request, Response } from "express";
import z from "zod";
import { RestaurantService } from "../services/restaurant.service";
import { CreateRestaurantDTO, UpdateRestaurantDTO } from "../dtos/restaurant.dtos";

const restaurantService = new RestaurantService();

export class RestaurantController {

  // ✅ Create Restaurant (Owner Only)
  async createRestaurant(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided"
        });
      }

      const parsedData = CreateRestaurantDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error)
        });
      }

      // If image uploaded
      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const restaurant = await restaurantService.createRestaurant(
        ownerId,
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Restaurant created successfully",
        data: restaurant
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }


  // ✅ Get My Restaurant (Owner Dashboard)
  async getMyRestaurant(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided"
        });
      }

      const restaurant = await restaurantService.getRestaurantByOwner(ownerId);

      return res.status(200).json({
        success: true,
        message: "Restaurant fetched successfully",
        data: restaurant
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }


  // ✅ Get Restaurant By ID (Public)
 async getRestaurantById(
    req: Request<{ id: string }>,
    res: Response
    ) {
    try {
        const { id } = req.params;

        const restaurant = await restaurantService.getRestaurantById(id);

        return res.status(200).json({
        success: true,
        message: "Restaurant fetched successfully",
        data: restaurant
        });

    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error"
        });
    }
    }



  // ✅ Get All Restaurants (Public Homepage)
  async getAllRestaurants(req: Request, res: Response) {
    try {
      const restaurants = await restaurantService.getAllRestaurants();

      return res.status(200).json({
        success: true,
        message: "Restaurants fetched successfully",
        data: restaurants
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }


  // ✅ Update Restaurant (Owner Only)
  async updateRestaurant(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided"
        });
      }

      const parsedData = UpdateRestaurantDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error)
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedRestaurant = await restaurantService.updateRestaurant(
        ownerId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Restaurant updated successfully",
        data: updatedRestaurant
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }


  // ✅ Delete Restaurant (Owner Only)
  async deleteRestaurant(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided"
        });
      }

      await restaurantService.deleteRestaurant(ownerId);

      return res.status(200).json({
        success: true,
        message: "Restaurant deleted successfully"
      });

    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    }
  }
}
