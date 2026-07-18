import express from "express";
import protect from "../../middleware/auth.js";

import {
  createOrGetConversation,
  getMyConversations,
} from "./conversation.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyConversations);

router.post("/:taskId", createOrGetConversation);

export default router;