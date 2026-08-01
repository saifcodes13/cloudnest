import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import { logger } from "./config/logger.js";

// Handle uncaught exceptions globally
process.on("uncaughtException", (err) => {
  logger.error("❌ UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

// Connect to Database
await connectDB();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

// Set server timeouts to 15 minutes (900000ms) to support large file uploads
server.timeout = 900000;
server.requestTimeout = 900000;

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  logger.error("❌ UNHANDLED REJECTION! Shutting down gracefully...", err);
  server.close(() => {
    process.exit(1);
  });
});
// Nodemon restart anchor
