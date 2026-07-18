import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";

import { initializeSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// IMPORTANT
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});