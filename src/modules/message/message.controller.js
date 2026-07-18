import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import { getIO } from "../../socket/socket.js";

import Message from "./message.model.js";
import Conversation from "../conversation/conversation.model.js";


export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant =
    conversation.client.toString() === req.user._id.toString() ||
    conversation.worker.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw new ApiError(403, "Unauthorized");
  }

  const messages = await Message.find({
    conversation: conversationId,
  })
    .populate("sender", "name profileImage")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});


export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isClient =
    conversation.client.toString() === req.user._id.toString();

  const isWorker =
    conversation.worker.toString() === req.user._id.toString();

  if (!isClient && !isWorker) {
    throw new ApiError(403, "Unauthorized");
  }

  const receiver = isClient
    ? conversation.worker
    : conversation.client;

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    receiver,
    text,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name profileImage");

  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();

  await conversation.save();

  const io = getIO();

  io.to(conversationId).emit(
    "receive-message",
    populatedMessage
  );

  io.to(conversationId).emit(
    "conversation-updated",
    {
      conversationId,
      lastMessage: text,
      lastMessageAt: conversation.lastMessageAt,
    }
  );

  res.status(201).json({
    success: true,
    message: populatedMessage,
  });
});


export const markAsSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await Message.updateMany(
    {
      conversation: conversationId,
      receiver: req.user._id,
      seen: false,
    },
    {
      seen: true,
    }
  );

  const io = getIO();

  io.to(conversationId).emit("messages-seen", {
    conversationId,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Messages marked as seen",
  });
});