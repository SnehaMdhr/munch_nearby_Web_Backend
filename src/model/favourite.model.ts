
import mongoose, { Document, Schema } from "mongoose";
import { FavouriteType } from "../types/favourite.type";

const FavouriteSchema: Schema = new Schema(
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

export interface IFavourite extends FavouriteType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const FavouriteModel = mongoose.model<IFavourite>("Favourite", FavouriteSchema);
