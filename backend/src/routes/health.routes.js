import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const router = Router();

router.get(
  "/",

  asyncHandler(async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const healthData = {
      uptime: process.uptime(), // How many seconds the server has been running without crashing
      message: "Server is healthy",
      timestamp: new Date(), // The exact time and date of the checkup
      status: "UP", // A quick "thumbs up" status
      database: {
        status: dbStatusMap[dbState] || "unknown", // The translated database status from step 2
        connectionState: dbState,
      },
      system: {
        memory: process.memoryUsage(), // How much RAM the server is using right now
        cpuUsage: process.cpuUsage(), // How hard the computer's brain (CPU) is working
      },
    };

    return ApiResponse.success(res, healthData, "System health retrieved successfully");
  })
);

export default router;
