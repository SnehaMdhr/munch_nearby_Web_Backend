import { CreateMenuDTO, UpdateMenuDTO } from "../dtos/menu.dtos";
import { HttpError } from "../errors/http-error";
import { MenuRepository } from "../repositories/menu.repository";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import fs from "fs";
import path from "path";


const menuRepository = new MenuRepository();
const restaurantRepository = new RestaurantRepository();

export class MenuService {

  // ✅ Create Menu (Owner Only)
  async createMenu(ownerId: string, data: CreateMenuDTO) {

    // Check if restaurant exists for this owner
    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found for this owner");
    }

    // Attach restaurant ID to menu
    const menu = await menuRepository.createMenu({
      ...data,
      restaurant: restaurant._id
    });

    return menu;
  }


  // ✅ Get Menu By ID
  async getMenuById(id: string) {

    const menu = await menuRepository.getMenuById(id);

    if (!menu) {
      throw new HttpError(404, "Menu not found");
    }

    return menu;
  }


  // ✅ Get Menus By Restaurant (Public)
  async getMenusByRestaurant(restaurantId: string) {

    const restaurant = await restaurantRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    return await menuRepository.getMenusByRestaurant(restaurantId);
  }


  // ✅ Get All Menus
  async getAllMenus() {
    return await menuRepository.getAllMenus();
  }


  // ✅ Update Menu (Owner Only)
  async updateMenu(
    ownerId: string,
    menuId: string,
    data: UpdateMenuDTO
  ) {

    const menu = await menuRepository.getMenuById(menuId);

    if (!menu) {
      throw new HttpError(404, "Menu not found");
    }

    // Check if owner owns the restaurant
    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant || !menu.restaurant.equals(restaurant._id)) {
      throw new HttpError(403, "Unauthorized to update this menu");
    }

    if (data.imageUrl && menu.imageUrl && menu.imageUrl !== data.imageUrl) {
      try {
        const oldImageFilename = path.basename(menu.imageUrl);
        const oldImagePath = path.resolve(__dirname, "../../uploads", oldImageFilename);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (error) {
        console.error("Error deleting old menu image:", error);
      }
    }

    const updatedMenu = await menuRepository.updateMenu(menuId, data);

    return updatedMenu;
  }


  // ✅ Delete Menu (Owner Only)
  async deleteMenu(ownerId: string, menuId: string) {

    const menu = await menuRepository.getMenuById(menuId);

    if (!menu) {
      throw new HttpError(404, "Menu not found");
    }

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant || !menu.restaurant.equals(restaurant._id)) {
      throw new HttpError(403, "Unauthorized to delete this menu");
    }

    if (menu.imageUrl) {
      try {
        const imageFilename = path.basename(menu.imageUrl);
        const imagePath = path.resolve(__dirname, "../../uploads", imageFilename);

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error deleting menu image:", error);
      }
    }

    await menuRepository.deleteMenu(menuId);

    return true;
  }
}
