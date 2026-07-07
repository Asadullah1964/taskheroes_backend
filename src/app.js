import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import authRoutes from "./modules/auth/auth.routes.js";
import errorHandler from "./middleware/errorHandler.js";


const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
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

// Global Error Handler (Always Keep Last)
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;