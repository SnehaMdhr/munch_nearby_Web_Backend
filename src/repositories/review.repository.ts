import { QueryFilter } from "mongoose";
import { IReview, ReviewModel } from "../model/review.model";

export interface IReviewRepository {
  createReview(data: Partial<IReview>): Promise<IReview>;

  getReviewById(id: string): Promise<IReview | null>;

  getReviewsByRestaurant(restaurantId: string): Promise<IReview[]>;

  getReviewsByCustomer(customerId: string): Promise<IReview[]>;

  getAllPaginated(
    page: number,
    size: number
  ): Promise<{ reviews: IReview[]; total: number }>;

  updateReview(
    id: string,
    updateData: Partial<IReview>
  ): Promise<IReview | null>;

  deleteReview(id: string): Promise<boolean>;
}

export class ReviewRepository implements IReviewRepository {

  async createReview(
    data: Partial<IReview>
  ): Promise<IReview> {
    const review = new ReviewModel(data);
    return await review.save();
  }

  async getReviewById(
    id: string
  ): Promise<IReview | null> {
    return await ReviewModel.findById(id)
      .populate("customer", "name email")
      .populate("restaurant", "name category");
  }

  async getReviewsByRestaurant(
    restaurantId: string
  ): Promise<IReview[]> {
    return await ReviewModel.find({ restaurant: restaurantId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });
  }

  async getReviewsByCustomer(
    customerId: string
  ): Promise<IReview[]> {
    return await ReviewModel.find({ customer: customerId })
      .populate("restaurant", "name category")
      .sort({ createdAt: -1 });
  }

  async getAllPaginated(
    page: number,
    size: number
  ): Promise<{ reviews: IReview[]; total: number }> {

    const query: QueryFilter<IReview> = {};

    const total = await ReviewModel.countDocuments(query);

    const reviews = await ReviewModel.find(query)
      .skip((page - 1) * size)
      .limit(size)
      .select("rating comment createdAt")
      .sort({ createdAt: -1 });

    return { reviews, total };
  }

  async updateReview(
    id: string,
    updateData: Partial<IReview>
  ): Promise<IReview | null> {
    return await ReviewModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
