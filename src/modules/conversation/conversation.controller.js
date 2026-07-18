import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

import Conversation from "./conversation.model.js";
import Task from "../task/task.model.js";

export const createOrGetConversation = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!task.assignedWorker) {
    throw new ApiError(400, "Worker has not been assigned yet");
  }

  const isClient =
    task.client.toString() === req.user._id.toString();

  const isWorker =
    task.assignedWorker.toString() === req.user._id.toString();

  if (!isClient && !isWorker) {
    throw new ApiError(
      403,
      "You are not allowed to access this conversation"
    );
  }

  let conversation = await Conversation.findOne({
    task: taskId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      task: task._id,
      client: task.client,
      worker: task.assignedWorker,
    });
  }

  conversation = await Conversation.findById(conversation._id)
    .populate("client", "name profileImage")
    .populate("worker", "name profileImage")
    .populate("task", "title category status budget location");

  res.status(200).json({
    success: true,
    conversation,
  });
});

export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    $or: [
      { client: req.user._id },
      { worker: req.user._id },
    ],
  })
    .populate("client", "name profileImage")
    .populate("worker", "name profileImage")
    .populate("task", "title category status")
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});