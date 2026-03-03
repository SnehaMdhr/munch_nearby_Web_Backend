import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dtos";
import { HttpError } from "../errors/http-error";
import { ReviewRepository } from "../repositories/review.repository";
import { RestaurantRepository } from "../repositories/restaurant.repositiry";
import { ReviewModel } from "../model/review.model";
import mongoose from "mongoose";

const reviewRepository = new ReviewRepository();
const restaurantRepository = new RestaurantRepository();

export class ReviewService {
  private async refreshRestaurantReviewStats(restaurantId: string) {
    const objectId = new mongoose.Types.ObjectId(restaurantId);

    const stats = await ReviewModel.aggregate([
      { $match: { restaurant: objectId } },
      {
        $group: {
          _id: "$restaurant",
          totalReviews: { $sum: 1 },
          averageReviews: { $avg: "$rating" },
        },
      },
    ]);

    const totalReviews = stats[0]?.totalReviews ?? 0;
    const averageReviews = stats[0]?.averageReviews ?? 0;

    await restaurantRepository.updateRestaurant(restaurantId, {
      totalReviews,
      averageReviews: Number(averageReviews.toFixed(2)),
    } as any);
  }

  async createReview(customerId: string, data: CreateReviewDTO) {
    const restaurant = await restaurantRepository.getRestaurantById(
      data.restaurantId,
    );
    if (!restaurant) {
      throw new HttpError(404, "Restaurant not found in database");
    }

    const alreadyReviewed = await ReviewModel.findOne({
      customer: customerId,
      restaurant: data.restaurantId,
    });

    if (alreadyReviewed) {
      throw new HttpError(400, "You have already reviewed this restaurant");
    }

    const review = await reviewRepository.createReview({
      customer: new mongoose.Types.ObjectId(customerId),
      restaurant: new mongoose.Types.ObjectId(data.restaurantId),
      rating: data.rating,
      comment: data.comment,
    });

    await this.refreshRestaurantReviewStats(data.restaurantId);

    return review;
  }

  async getReviewsByRestaurant(restaurantId: string) {
    const restaurant =
      await restaurantRepository.getRestaurantById(restaurantId);
    if (!restaurant) throw new HttpError(404, "Restaurant not found");

    return await reviewRepository.getReviewsByRestaurant(restaurantId);
  }

  async deleteReview(customerId: string, reviewId: string) {
    const review = await reviewRepository.getReviewById(reviewId);
    if (!review) throw new HttpError(404, "Review not found");

    const restaurantId = (
      (review.restaurant as any)?._id || review.restaurant
    ).toString();
    const ownerId = (review.customer as any)._id || review.customer;
    if (ownerId.toString() !== customerId) {
      throw new HttpError(403, "Unauthorized to delete this review");
    }

    await reviewRepository.deleteReview(reviewId);
    await this.refreshRestaurantReviewStats(restaurantId);
    return true;
  }

  async updateReview(
    customerId: string,
    reviewId: string,
    data: UpdateReviewDTO,
  ) {
    const review = await reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new HttpError(404, "Review not found");
    }
    const ownerId = (review.customer as any)._id || review.customer;

    if (ownerId.toString() !== customerId) {
      throw new HttpError(403, "Unauthorized to update this review");
    }

    const updatedReview = await reviewRepository.updateReview(reviewId, data);

    const restaurantId = (
      (review.restaurant as any)?._id || review.restaurant
    ).toString();
    await this.refreshRestaurantReviewStats(restaurantId);

    return updatedReview;
  }
  async getReviewsForOwner(ownerId: string) {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      throw new HttpError(400, "Invalid owner id");
    }

    const reviews = await reviewRepository.getReviewsForOwner(ownerId);

    if (!reviews || reviews.length === 0) {
      return [];
    }

    return reviews;
  }
  async adminDeleteReview(reviewId: string) {
    const review = await reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new HttpError(404, "Review not found");
    }

    const restaurantId = (
      (review.restaurant as any)?._id || review.restaurant
    ).toString();

    await reviewRepository.deleteReview(reviewId);

    await this.refreshRestaurantReviewStats(restaurantId);

    return true;
  }
}
