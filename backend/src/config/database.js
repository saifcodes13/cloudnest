import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("🔌 MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error(`❌ MongoDB connection pool error: ${err.message}`);
});

// Close database connection pool gracefully on app shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("🔌 Mongoose connection disconnected through app termination (SIGINT)");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  logger.info("🔌 Mongoose connection disconnected through app termination (SIGTERM)");
  process.exit(0);
});
