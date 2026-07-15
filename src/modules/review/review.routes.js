import express from "express";

import protect from "../../middleware/auth.js";

import {
  createReview,
  getWorkerReviews,
  getMyReviews,
} from "./review.controller.js";

const router = express.Router();

// Create review (Only client after task completion)
router.post("/:taskId", protect, createReview);

// Get all reviews of a worker
router.get("/worker/:workerId", getWorkerReviews);

// Get reviews received by the logged-in worker
router.get("/my-reviews", protect, getMyReviews);

export default router;