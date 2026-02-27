import { Request, Response } from "express";
import z from "zod";
import { RestaurantService } from "../services/restaurant.service";
import { CreateRestaurantDTO, UpdateRestaurantDTO } from "../dtos/restaurant.dtos";

const restaurantService = new RestaurantService();

const parseOpeningHoursFromFormData = (body: any) => {
  if (typeof body?.openingHours === "string") {
    try {
      body.openingHours = JSON.parse(body.openingHours);
    } catch {
      throw new Error("Invalid openingHours JSON format");
    }
  }
};

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

      try {
        parseOpeningHoursFromFormData(req.body);
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          message: error.message
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

  async updateRestaurant(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided"
        });
      }

      try {
        parseOpeningHoursFromFormData(req.body);
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          message: error.message
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


async approveRestaurant(req: Request, res: Response) {
  try {
    const  id  = req.params.id as string;

    const restaurant =
      await restaurantService.approveRestaurant(id);

    return res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
      data: restaurant
    });

  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message
    });
  }
}

async rejectRestaurant(req: Request, res: Response) {
  try {
    const  id  = req.params.id as string;

    const restaurant =
      await restaurantService.rejectRestaurant(id);

    return res.status(200).json({
      success: true,
      message: "Restaurant rejected successfully",
      data: restaurant
    });

  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message
    });
  }
}

async suspendRestaurant(req: Request, res: Response) {
  try {
    const id  = req.params.id as string;

    const restaurant =
      await restaurantService.suspendRestaurant(id);

    return res.status(200).json({
      success: true,
      message: "Restaurant suspended successfully",
      data: restaurant
    });

  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message
    });
  }
}

async deleteRestaurantByAdmin(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    await restaurantService.deleteRestaurantByAdmin(id);

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully"
    });

  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message
    });
  }
}

async getAllRestaurantsForAdmin(req: Request, res: Response) {
  try {

    const restaurants =
      await restaurantService.getAllRestaurantsForAdmin();

    return res.status(200).json({
      success: true,
      data: restaurants
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}
}
