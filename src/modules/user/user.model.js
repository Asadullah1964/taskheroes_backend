import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            default: null,
            select: false,
        },

        authProvider: {
            type: String,
            enum: ["email", "google"],
            default: "email",
        },

        googleId: {
            type: String,
            default: null,
        },

        phone: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["client", "worker"],
            required: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        isProfileCompleted: {
            type: Boolean,
            default: false,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;