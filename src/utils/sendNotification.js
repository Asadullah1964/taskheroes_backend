import notificationService from "../modules/notification/notification.service.js";
import { getIO } from "../socket/socket.js";

const sendNotification = async ({
  receiver,
  sender,
  type,
  title,
  message,
  link = "",
}) => {
  const notification =
    await notificationService.createNotification({
      receiver,
      sender,
      type,
      title,
      message,
      link,
    });

  const io = getIO();

  io.to(receiver.toString()).emit(
    "new-notification",
    notification
  );

  return notification;
};

export default sendNotification;