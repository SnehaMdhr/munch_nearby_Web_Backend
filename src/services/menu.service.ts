import { CreateMenuDTO, UpdateMenuDTO } from "../dtos/menu.dtos";
import { HttpError } from "../errors/http-error";
import { MenuRepository } from "../repositories/menu.repository";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { deleteUploadIfExists } from "../utils/upload-path";

const menuRepository = new MenuRepository();
const restaurantRepository = new RestaurantRepository();

export class MenuService {
  async createMenu(ownerId: string, data: CreateMenuDTO) {
    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found for this owner");
    }
    const menu = await menuRepository.createMenu({
      ...data,
      restaurant: restaurant._id,
    });

    return menu;
  }

  async getMenuById(id: string) {
    const menu = await menuRepository.getMenuById(id);

    if (!menu) {
      throw new HttpError(404, "Menu not found");
    }

    return menu;
  }

  async getMenusByRestaurant(restaurantId: string) {
    const restaurant =
      await restaurantRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found");
    }

    return await menuRepository.getMenusByRestaurant(restaurantId);
  }

  async getAllMenus() {
    return await menuRepository.getAllMenus();
  }

  async updateMenu(ownerId: string, menuId: string, data: UpdateMenuDTO) {
    const menu = await menuRepository.getMenuById(menuId);

    if (!menu) {
      throw new HttpError(404, "Menu not found");
    }

    const restaurant = await restaurantRepository.getRestaurantByOwner(ownerId);

    if (!restaurant || !menu.restaurant.equals(restaurant._id)) {
      throw new HttpError(403, "Unauthorized to update this menu");
    }

    if (data.imageUrl && menu.imageUrl && menu.imageUrl !== data.imageUrl) {
      try {
        deleteUploadIfExists(menu.imageUrl);
      } catch (error) {
        console.error("Error deleting old menu image:", error);
      }
    }

    const updatedMenu = await menuRepository.updateMenu(menuId, data);

    return updatedMenu;
  }

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
        deleteUploadIfExists(menu.imageUrl);
      } catch (error) {
        console.error("Error deleting menu image:", error);
      }
    }

    await menuRepository.deleteMenu(menuId);

    return true;
  }

  async adminDeleteMenu(menuId: string) {
    const menu = await menuRepository.getMenuById(menuId);

    if (!menu) {
      throw new HttpError(404, "Menu not found");
    }

    if (menu.imageUrl) {
      try {
        deleteUploadIfExists(menu.imageUrl);
      } catch (error) {
        console.error("Error deleting menu image:", error);
      }
    }

    await menuRepository.deleteMenu(menuId);

    return true;
  }
}
