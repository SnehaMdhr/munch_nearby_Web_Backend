;import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dtos";
import { HttpError } from "../errors/http-error";
import { ReviewRepository } from "../repositories/review.repository";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { ReviewModel } from "../model/review.model"; // Added for direct check
import mongoose from "mongoose";

const reviewRepository = new ReviewRepository();
const restaurantRepository = new RestaurantRepository();

export class ReviewService {
  async createReview(customerId: string, data: CreateReviewDTO) {
    // 1. Check if restaurant exists
    const restaurant = await restaurantRepository.getRestaurantById(data.restaurantId);
    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found in database");
    }

    // 2. Prevent duplicate review (Optimized Database Check)
    const alreadyReviewed = await ReviewModel.findOne({
      customer: customerId,
      restaurant: data.restaurantId,
    });

    if (alreadyReviewed) {
      throw new HttpError(400, "You have already reviewed this restaurant");
    }

    // 3. Create review
    const review = await reviewRepository.createReview({
      customer: new mongoose.Types.ObjectId(customerId),
      restaurant: new mongoose.Types.ObjectId(data.restaurantId),
      rating: data.rating,
      comment: data.comment,
    });

    return review;
  }

  async getReviewsByRestaurant(restaurantId: string) {
    const restaurant = await restaurantRepository.getRestaurantById(restaurantId);
    if (!restaurant) throw new HttpError(404, "Restaurant not found");

    return await reviewRepository.getReviewsByRestaurant(restaurantId);
  }

  async deleteReview(customerId: string, reviewId: string) {
    const review = await reviewRepository.getReviewById(reviewId);
    if (!review) throw new HttpError(404, "Review not found");

    // Check ownership
    const ownerId = (review.customer as any)._id || review.customer;
    if (ownerId.toString() !== customerId) {
      throw new HttpError(403, "Unauthorized to delete this review");
    }

    await reviewRepository.deleteReview(reviewId);
    return true;
  }

  async updateReview(
  customerId: string,
  reviewId: string,
  data: UpdateReviewDTO
) {
  const review = await reviewRepository.getReviewById(reviewId);

  if (!review) {
    throw new HttpError(404, "Review not found");
  }

  // Check ownership
  const ownerId = (review.customer as any)._id || review.customer;

  if (ownerId.toString() !== customerId) {
    throw new HttpError(403, "Unauthorized to update this review");
  }

  const updatedReview = await reviewRepository.updateReview(
    reviewId,
    data
  );

  return updatedReview;
}


}