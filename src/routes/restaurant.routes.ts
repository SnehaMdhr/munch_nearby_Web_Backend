import { Router } from "express";
import { RestaurantController } from "../controller/restaurant.controller";
import { authorizedMiddleware, restaurantOwnerOnlyMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const restaurantController = new RestaurantController();

router.get(
  "/",
  restaurantController.getAllRestaurants
);

// Get restaurant by ID
router.get(
  "/:id",
  restaurantController.getRestaurantById
);

// Create restaurant
router.post(
  "/create",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  uploads.single("imageUrl"),
  restaurantController.createRestaurant
);

// Get my restaurant
router.get(
  "/my-restaurant",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  restaurantController.getMyRestaurant
);

// Update my restaurant
router.put(
  "/update",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  uploads.single("imageUrl"),
  restaurantController.updateRestaurant
);

// Delete my restaurant
router.delete(
  "/",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  restaurantController.deleteRestaurant
);

export default router;
