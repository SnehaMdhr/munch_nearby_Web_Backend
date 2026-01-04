import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: { type: String, required: true, unique: true, minlength: 5 },
        password: { type: String, required: true, minlength: 8 },
        name: { type: String },
        role: { type: String, enum: ["Customer","Restaurant Owner", "admin"], default: "Customer" },
    },
    { timestamps: true } 
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);

