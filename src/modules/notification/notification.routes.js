import express from "express";

import protect from "../../middleware/auth.js";

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notification.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);

router.get("/unread-count", getUnreadCount);

router.patch("/:id/read", markNotificationRead);

router.patch("/read-all", markAllNotificationsRead);

export default router;