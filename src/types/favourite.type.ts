import mongoose from "mongoose";

export interface FavoriteType {
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
}
