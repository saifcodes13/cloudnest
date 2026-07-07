import express from "express";
import cors from "cors";
import helmet from "helmet";
import requestLogger from "./middleware/requestLogger.js";
import rateLimiter from "./middleware/rateLimiter.js";
import mainRouter from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/customError.js";

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors());

// Rate Limiting
app.use(rateLimiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP Request Logging
app.use(requestLogger);

// API Routing
app.use("/api/v1", mainRouter);

// Root route welcome message
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CloudNest API. Status is operational.",
    version: "1.0.0",
  });
});

// Catch-all route for undefined paths
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized error handler middleware
app.use(errorHandler);

export default app;
