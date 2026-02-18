  import { Router } from "express";
  import { MenuController } from "../controller/menu.controller";
  import { authorizedMiddleware, restaurantOwnerOnlyMiddleware } from "../middlewares/authorized.middleware";

  const router = Router();
  const menuController = new MenuController();


  // ✅ Get all menus (Public)
  router.get(
    "/",
    menuController.getAllMenus
  );


  // ✅ Create menu (Owner only)
  router.post(
    "/create",
    authorizedMiddleware,
    restaurantOwnerOnlyMiddleware,
    menuController.createMenu
  );


  // ✅ Get menus by restaurant (Public)
  router.get(
    "/restaurant/:restaurantId",
    menuController.getMenusByRestaurant
  );


  // ✅ Get menu by ID (Public)
  router.get(
    "/:id",
    menuController.getMenuById
  );


  // ✅ Update menu (Owner only)
  router.put(
    "/update/:id",
    authorizedMiddleware,
    restaurantOwnerOnlyMiddleware,
    menuController.updateMenu
  );


  // ✅ Delete menu (Owner only)
  router.delete(
    "/delete/:id",
    authorizedMiddleware,
    restaurantOwnerOnlyMiddleware,
    menuController.deleteMenu
  );


  export default router;
