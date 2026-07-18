import express from "express";
import  protect  from "../../middleware/auth.js";

import {
  getMessages,
  sendMessage,
  markAsSeen,
} from "./message.controller.js";

const router = express.Router();

router.use(protect);

router.get("/:conversationId", getMessages);

router.post("/:conversationId", sendMessage);

router.patch("/:conversationId/seen", markAsSeen);

export default router;