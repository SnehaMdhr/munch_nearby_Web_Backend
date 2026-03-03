import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: { type: String, required: true, unique: true, minlength: 5 },
        password: {
            type: String,
            required: function (this: { authProvider?: string }): boolean {
                return this.authProvider === "local";
            },
            minlength: 8,
        },
        authProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
        name: { type: String },
        role: { type: String, enum: ["Customer","Restaurant Owner", "admin"], default: "Customer" },
        imageUrl: { type: String, required: false },

        otp: { type: String },
        resetOtpExpiry: { type: Date },

        
    },
    { timestamps: true } 
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);

