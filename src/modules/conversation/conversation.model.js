import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One conversation per task
conversationSchema.index({ task: 1 }, { unique: true });

// Faster dashboard queries
conversationSchema.index({ client: 1 });
conversationSchema.index({ worker: 1 });

export default mongoose.model("Conversation", conversationSchema);