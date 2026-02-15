import { CreateMenuDTO, UpdateMenuDTO } from "../dtos/menu.dtos";
import { HttpError } from "../errors/http-error";
import { MenuRepository } from "../repositories/menu.repository";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";


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

    await menuRepository.deleteMenu(menuId);

    return true;
  }
}
