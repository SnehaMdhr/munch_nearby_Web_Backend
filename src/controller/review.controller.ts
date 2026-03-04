import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dtos";
const reviewService = new ReviewService();

export class ReviewController {
  async createReview(req: Request<{ restaurantId: string }>, res: Response) {
    try {
      const customerId = req.user?._id;

      if (!customerId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No user ID" });
      }

      const { restaurantId } = req.params;
      const parsedData = CreateReviewDTO.safeParse({
        ...req.body,
        restaurantId,
      });

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsedData.error.flatten().fieldErrors, // Replaced prettifyError
        });
      }

      const review = await reviewService.createReview(
        customerId.toString(),
        parsedData.data,
      );

      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error: any) {
      console.error("Create Review Error:", error);
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async getReviewsByRestaurant(
    req: Request<{ restaurantId: string }>,
    res: Response,
  ) {
    try {
      const { restaurantId } = req.params;
      const reviews = await reviewService.getReviewsByRestaurant(restaurantId);

      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async deleteReview(req: Request<{ id: string }>, res: Response) {
    try {
      const customerId = req.user?._id;
      if (!customerId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      await reviewService.deleteReview(customerId.toString(), req.params.id);

      return res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async updateReview(req: Request<{ id: string }>, res: Response) {
    try {
      const customerId = req.user?._id;

      if (!customerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsedData = UpdateReviewDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsedData.error.flatten().fieldErrors,
        });
      }

      const updatedReview = await reviewService.updateReview(
        customerId.toString(),
        req.params.id,
        parsedData.data,
      );

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: updatedReview,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getReviewsForOwner(req: Request, res: Response) {
    try {
      const ownerId = req.user?._id;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const reviews = await reviewService.getReviewsForOwner(
        ownerId.toString(),
      );

      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async adminDeleteReview(req: Request<{ id: string }>, res: Response) {
    try {
      await reviewService.adminDeleteReview(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Review deleted by admin",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
