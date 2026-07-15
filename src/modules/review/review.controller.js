import Task from "../task/task.model.js";
import Review from "./review.model.js";
import User from "../user/user.model.js";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

import { createReviewSchema } from "./review.validation.js";

export const createReview = asyncHandler(async (req, res) => {
  const { error } = createReviewSchema.validate(req.body);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Only client
  if (task.client.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Only task owner can review"
    );
  }

  if (task.status !== "Completed") {
    throw new ApiError(
      400,
      "Complete the task before reviewing"
    );
  }

  const acceptedApplication = task.applications.find(
    (app) => app.status === "Accepted"
  );

  if (!acceptedApplication) {
    throw new ApiError(
      400,
      "No worker assigned"
    );
  }

 const existingReview = await Review.findOne({
  task: task._id,
  client: req.user._id,
  worker: acceptedApplication.worker,
});

  if (existingReview) {
    throw new ApiError(
      400,
      "Review already submitted"
    );
  }

  const review = await Review.create({
    task: task._id,
    client: req.user._id,
    worker: acceptedApplication.worker,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  // Update worker average rating
  const reviews = await Review.find({
    worker: acceptedApplication.worker,
  });

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) /
    reviews.length;

  await User.findByIdAndUpdate(
  acceptedApplication.worker,
  {
    "workerProfile.rating": Number(
      average.toFixed(1)
    ),
    "workerProfile.totalReviews": reviews.length,
  }
);

const populatedReview = await Review.findById(review._id)
  .populate("worker", "name profileImage")
  .populate("client", "name profileImage");

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    review: populatedReview,
  });
});

export const getMyReviews = asyncHandler(async (req, res) => {
  if (req.user.role !== "worker") {
    throw new ApiError(
      403,
      "Only workers can access this resource"
    );
  }

  const reviews = await Review.find({
    worker: req.user._id,
  })
    .populate("client", "name profileImage")
    .populate("task", "title")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

export const getWorkerReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    worker: req.params.workerId,
  })
    .populate("client", "name profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});