import { Router } from "express";
import { MenuController } from "../controller/menu.controller";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
} from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const menuController = new MenuController();

router.get("/", menuController.getAllMenus);

router.post(
  "/create",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  uploads.single("imageUrl"),
  menuController.createMenu,
);

router.get("/restaurant/:restaurantId", menuController.getMenusByRestaurant);

router.get("/:id", menuController.getMenuById);

router.put(
  "/update/:id",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  uploads.single("imageUrl"),
  menuController.updateMenu,
);

router.delete(
  "/delete/:id",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  menuController.deleteMenu,
);

router.delete(
  "/admin/delete/:id",
  authorizedMiddleware,
  adminOnlyMiddleware,
  menuController.adminDeleteMenu,
);

export default router;
