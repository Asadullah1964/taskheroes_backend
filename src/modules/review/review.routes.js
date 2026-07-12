import express from "express";

import protect from "../../middleware/auth.js";

import { createReview } from "./review.controller.js";

const router = express.Router();

router.post(
  "/:taskId",
  protect,
  createReview
);

export default router;