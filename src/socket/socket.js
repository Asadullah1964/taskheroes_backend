import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);

    socket.join(userId);

    console.log(`${userId} joined personal room`);

    io.emit(
      "online-users",
      Array.from(onlineUsers.keys())
    );
});

    socket.on("join-conversation", (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
      console.log(`Joined room ${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId);
    });

    socket.on("typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit("typing", {
        conversationId,
        userId: Array.from(onlineUsers.entries()).find(
          ([, socketId]) => socketId === socket.id
        )?.[0],
      });
    });

    socket.on("stop-typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit("stop-typing", {
        conversationId,
      });
    });

    socket.on("disconnecting", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};