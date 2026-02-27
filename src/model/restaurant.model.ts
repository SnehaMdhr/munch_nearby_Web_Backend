import mongoose, { Document, Schema } from "mongoose";
import { RestaurantStatus, RestaurantType } from "../types/restaurant.type";


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
        type: [Number],
      }
    },
    
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      unique: true 
    },

    status: {
      type: String,
      enum: Object.values(RestaurantStatus),
      default: RestaurantStatus.PENDING
    },

    isDeleted: {
      type: Boolean,
      default: false
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
