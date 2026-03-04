import { Router } from "express";
import { RestaurantController } from "../controller/restaurant.controller";
import { adminOnlyMiddleware, authorizedMiddleware, restaurantOwnerOnlyMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const restaurantController = new RestaurantController();

router.get(
  "/",
  restaurantController.getAllRestaurants
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

// Get restaurant by ID
router.get(
  "/:id",
  restaurantController.getRestaurantById
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


  router.get(
    "/admin/restaurants",
    authorizedMiddleware,
    adminOnlyMiddleware,
    restaurantController.getAllRestaurantsForAdmin
  );

  router.patch(
    "/admin/restaurants/:id/approve",
    authorizedMiddleware,
    adminOnlyMiddleware,
    restaurantController.approveRestaurant
  );

  router.patch(
    "/admin/restaurants/:id/reject",
    authorizedMiddleware,
    adminOnlyMiddleware,
    restaurantController.rejectRestaurant
  );

  router.patch(
    "/admin/restaurants/:id/suspend",
    authorizedMiddleware,
    adminOnlyMiddleware,
    restaurantController.suspendRestaurant
  );

  router.delete(
    "/admin/restaurants/:id",
    authorizedMiddleware,
    adminOnlyMiddleware,
    restaurantController.deleteRestaurantByAdmin
  );

export default router;
