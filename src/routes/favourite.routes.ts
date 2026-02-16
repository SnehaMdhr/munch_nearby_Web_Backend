import { Router } from "express";
import {
  authorizedMiddleware,
  customerOnlyMiddleware
} from "../middlewares/authorized.middleware";
import { FavoriteController } from "../controller/favourite.controller";

const router = Router();
const favoriteController = new FavoriteController();

// Add to favorite
router.post(
  "/:restaurantId",
  authorizedMiddleware,
  customerOnlyMiddleware,
  favoriteController.add
);

// Remove from favorite
router.delete(
  "/:restaurantId",
  authorizedMiddleware,
  customerOnlyMiddleware,
  favoriteController.remove
);

// Get my favorites
router.get(
  "/my",
  authorizedMiddleware,
  customerOnlyMiddleware,
  favoriteController.getMyFavorites
);

export default router;
