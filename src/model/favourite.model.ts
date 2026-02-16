import mongoose, { Schema, Document } from "mongoose";
import { FavoriteType } from "../types/favourite.type";


export interface IFavorite extends FavoriteType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    }
  },
  { timestamps: true }
);

// 🚨 Prevent duplicate favorites
FavoriteSchema.index({ customer: 1, restaurant: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavorite>(
  "Favorite",
  FavoriteSchema
);
