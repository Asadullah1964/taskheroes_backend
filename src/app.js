import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import authRoutes from "./modules/auth/auth.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./modules/user/user.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import conversationRoutes from "./modules/conversation/conversation.routes.js";
import messageRoutes from "./modules/message/message.routes.js";

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

console.log("CLIENT_URL from env:", CLIENT_URL);

const corsOptions = {
    origin: function (origin, callback) {
        console.log("Incoming Origin:", origin);

        if (!origin) return callback(null, true);

        if (origin === CLIENT_URL) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// app.options("/{*splat}", cors(corsOptions)); // only add this if needed

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());
app.use(cookieParser());

app.use(
    helmet({
        crossOriginOpenerPolicy: false,
    })
);

app.use(hpp());
app.use(morgan("dev"));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TaskHeroes API Running 🚀",
    });
});

app.use(
  "/api/conversations",
  conversationRoutes
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use(errorHandler);


export default app;