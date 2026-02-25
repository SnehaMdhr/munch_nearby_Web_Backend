import mongoose, { Document, Schema } from "mongoose";
import { RestaurantType } from "../types/restaurant.type";

const OpeningHoursSchema = new Schema(
  {
    day: { type: String, required: true },
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);


const RestaurantSchema: Schema = new Schema(
  {
    name: {type: String, required: true,minlength: 2},
    address: {type: String, required: true, minlength: 5},
    mapLink: { type: String },
    contactNumber: {type: String, required: true},
    category: {type: String},
    description: {type: String},
    imageUrl: {type: String, required: false },

    openingHours: {
      type: [OpeningHoursSchema],
      default: [],
    },

    /* ⭐ REVIEW FIELDS */
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageReviews: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    menus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu"
      }
    ],

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
      }
    ],


    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },
    
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // MUST match your User model name
      required: true,
      unique: true // ensures one restaurant per owner
    }
  },
  { timestamps: true }
);

export interface IRestaurant extends RestaurantType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const RestaurantModel = mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
