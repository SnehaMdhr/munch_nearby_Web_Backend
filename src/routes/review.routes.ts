import { Router } from "express";
import { ReviewController } from "../controller/review.controller";
import { authorizedMiddleware, customerOnlyMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const reviewController = new ReviewController();


// ✅ Get reviews by restaurant (Public)
router.get(
  "/restaurant/:restaurantId",
  reviewController.getReviewsByRestaurant
);


// ✅ Create review (Customer only)
router.post(
  "/create/:restaurantId",
  authorizedMiddleware, customerOnlyMiddleware,
  reviewController.createReview
);



// ✅ Delete review (Customer only)
router.delete(
  "/delete/:id",
  authorizedMiddleware,
  reviewController.deleteReview
);




export default router;
