import { QueryFilter } from "mongoose";
import mongoose from "mongoose";
import { IMenu, MenuModel } from "../model/menu.model";

export interface IMenuRepository {
  createMenu(data: Partial<IMenu>): Promise<IMenu>;

  getMenuById(id: string): Promise<IMenu | null>;

  getMenusByRestaurant(restaurantId: string): Promise<IMenu[]>;

  getAllMenus(): Promise<IMenu[]>;

  getAllPaginated(
    page: number,
    size: number,
    search?: string
  ): Promise<{ menus: IMenu[]; total: number }>;

  updateMenu(
    id: string,
    updateData: Partial<IMenu>
  ): Promise<IMenu | null>;

  deleteMenu(id: string): Promise<boolean>;
}

export class MenuRepository implements IMenuRepository {

  async createMenu(
    data: Partial<IMenu>
  ): Promise<IMenu> {
    const menu = new MenuModel(data);
    return await menu.save();
  }

  async getMenuById(
    id: string
  ): Promise<IMenu | null> {
    return await MenuModel.findById(id)
      .populate("restaurant", "name category");
  }

  async getMenusByRestaurant(
    restaurantId: string
  ): Promise<IMenu[]> {
    return await MenuModel.find({ restaurant: restaurantId });
  }

  async getAllMenus(): Promise<IMenu[]> {
    return await MenuModel.find()
      .populate("restaurant", "name category");
  }

  async getAllPaginated(
    page: number,
    size: number,
    search?: string
  ): Promise<{ menus: IMenu[]; total: number }> {

    const query: QueryFilter<IMenu> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    const total = await MenuModel.countDocuments(query);

    const menus = await MenuModel.find(query)
      .skip((page - 1) * size)
      .limit(size)
      .select("name price category createdAt")
      .sort({ createdAt: -1 });

    return { menus, total };
  }

  async updateMenu(
    id: string,
    updateData: Partial<IMenu>
  ): Promise<IMenu | null> {
    return await MenuModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteMenu(id: string): Promise<boolean> {
    const result = await MenuModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
