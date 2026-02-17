import { Router } from "express";
import {
  authorizedMiddleware,
  customerOnlyMiddleware
} from "../middlewares/authorized.middleware";
import { FavouriteController } from "../controller/favourite.controller";

const router = Router();
const favouriteController = new FavouriteController();

// Add to favorite
router.post(
  "/:restaurantId",
  authorizedMiddleware,
  customerOnlyMiddleware,
  favouriteController.add
);

// Remove from favorite
router.delete(
  "/:restaurantId",
  authorizedMiddleware,
  customerOnlyMiddleware,
  favouriteController.remove
);

// Get my favorites
router.get(
  "/my",
  authorizedMiddleware,
  customerOnlyMiddleware,
  favouriteController.getMyFavorites
);

export default router;
