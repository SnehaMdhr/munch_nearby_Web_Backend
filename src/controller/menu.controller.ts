import { Request, Response } from "express";
import z from "zod";
import { MenuService } from "../services/menu.service";
import { CreateMenuDTO, UpdateMenuDTO } from "../dtos/menu.dtos";

const menuService = new MenuService();

export class MenuController {
  async createMenu(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided",
        });
      }

      const parsedData = CreateMenuDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const menu = await menuService.createMenu(ownerId, parsedData.data);

      return res.status(201).json({
        success: true,
        message: "Menu created successfully",
        data: menu,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMenuById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const menu = await menuService.getMenuById(id);

      return res.status(200).json({
        success: true,
        message: "Menu fetched successfully",
        data: menu,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMenusByRestaurant(
    req: Request<{ restaurantId: string }>,
    res: Response,
  ) {
    try {
      const { restaurantId } = req.params;

      const menus = await menuService.getMenusByRestaurant(restaurantId);

      return res.status(200).json({
        success: true,
        message: "Menus fetched successfully",
        data: menus,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllMenus(req: Request, res: Response) {
    try {
      const menus = await menuService.getAllMenus();

      return res.status(200).json({
        success: true,
        message: "Menus fetched successfully",
        data: menus,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMenu(req: Request<{ id: string }>, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided",
        });
      }

      const { id } = req.params;

      const parsedData = UpdateMenuDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedMenu = await menuService.updateMenu(
        ownerId,
        id,
        parsedData.data,
      );

      return res.status(200).json({
        success: true,
        message: "Menu updated successfully",
        data: updatedMenu,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteMenu(req: Request<{ id: string }>, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "User ID not provided",
        });
      }

      const { id } = req.params;

      await menuService.deleteMenu(ownerId, id);

      return res.status(200).json({
        success: true,
        message: "Menu deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async adminDeleteMenu(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      await menuService.adminDeleteMenu(id);

      return res.status(200).json({
        success: true,
        message: "Menu deleted successfully (Admin)",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
