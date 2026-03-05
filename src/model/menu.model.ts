import mongoose, { Document, Schema } from "mongoose";
import { MenuType } from "../types/menu.type";

const MenuSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    imageUrl: {
      type: String,
      required: false,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant", // MUST match your User model name
      required: true,
    },
  },
  { timestamps: true },
);

export interface IMenu extends MenuType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const MenuModel = mongoose.model<IMenu>("Menu", MenuSchema);
