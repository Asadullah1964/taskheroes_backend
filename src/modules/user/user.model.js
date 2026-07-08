import mongoose from "mongoose";

const workerProfileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: Number,
      default: 0,
    },

    hourlyRate: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    availability: {
      type: String,
      enum: ["Available", "Busy", "Offline"],
      default: "Available",
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

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
      default: "client",
    },

    profileImage: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    workerProfile: {
      type: workerProfileSchema,
      default: null,
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