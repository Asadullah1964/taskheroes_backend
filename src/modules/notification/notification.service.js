import Notification from "./notification.model.js";

const createNotification = async (data) => {
  return await Notification.create(data);
};

const getUserNotifications = async (userId) => {
  return await Notification.find({
    receiver: userId,
  })
    .populate("sender", "name profileImage")
    .sort({ createdAt: -1 });
};

const markAsRead = async (id, userId) => {
  return await Notification.findOneAndUpdate(
    {
      _id: id,
      receiver: userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
    }
  );
};

const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    {
      receiver: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    receiver: userId,
    isRead: false,
  });
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};