import asyncHandler from "../../utils/asyncHandler.js";
import notificationService from "./notification.service.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications =
    await notificationService.getUserNotifications(req.user._id);

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count =
    await notificationService.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    count,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification =
    await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );

  res.status(200).json({
    success: true,
    notification,
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });

//   await sendNotification({
//     receiver: req.user._id,
//     sender: req.user._id,
//     type: "MESSAGE",
//     title: "Test Notification",
//     message: "Notification system is working!",
//     link: "/dashboard",
// });

});