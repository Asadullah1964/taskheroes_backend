import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposal: {
      type: String,
      trim: true,
    },

    expectedPrice: Number,

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const taskSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "Assigned",
        "Completed",
        "Cancelled",
      ],
      default: "Open",
    },

    applications: [applicationSchema],
  },
  {
    timestamps: true,
  }
);

// Database Indexes
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ location: 1 });
taskSchema.index({ client: 1 });
taskSchema.index({ deadline: 1 });

export default mongoose.model("Task", taskSchema);