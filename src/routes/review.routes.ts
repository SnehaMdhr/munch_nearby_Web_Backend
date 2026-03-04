import { Router } from "express";
import { ReviewController } from "../controller/review.controller";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
  customerOnlyMiddleware,
  restaurantOwnerOnlyMiddleware,
} from "../middlewares/authorized.middleware";

const router = Router();
const reviewController = new ReviewController();
router.get(
  "/restaurant/:restaurantId",
  reviewController.getReviewsByRestaurant,
);

router.post(
  "/create/:restaurantId",
  authorizedMiddleware,
  customerOnlyMiddleware,
  reviewController.createReview,
);
router.delete(
  "/delete/:id",
  authorizedMiddleware,
  reviewController.deleteReview,
);
router.put(
  "/update/:id",
  authorizedMiddleware,
  customerOnlyMiddleware,
  reviewController.updateReview,
);

router.get(
  "/owner/my-reviews",
  authorizedMiddleware,
  restaurantOwnerOnlyMiddleware,
  reviewController.getReviewsForOwner,
);

router.delete(
  "/admin/delete/:id",
  authorizedMiddleware,
  adminOnlyMiddleware,
  reviewController.adminDeleteReview,
);

export default router;
