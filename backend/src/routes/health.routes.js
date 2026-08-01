import { Router } from "express";
import mongoose from "mongoose";
import os from "os";

import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const router = Router();

/**
 * ============================================================
 * Health Check Route
 * ============================================================
 *
 * Purpose:
 * --------
 * This endpoint is used to check whether the backend server
 * is running correctly.
 *
 * It is useful for:
 *
 * ✔ Monitoring tools
 * ✔ Load Balancers (Nginx)
 * ✔ Kubernetes Health Checks
 * ✔ Docker Health Checks
 * ✔ Debugging
 * ✔ Technical Interviews
 *
 * URL:
 * GET /api/v1/health
 *
 * ============================================================
 */

router.get(
  "/",
  asyncHandler(async (req, res) => {
    /**
     * MongoDB Connection States
     *
     * 0 = Disconnected
     * 1 = Connected
     * 2 = Connecting
     * 3 = Disconnecting
     */
    const dbState = mongoose.connection.readyState;

    const dbStatusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    /**
     * Collect all server information.
     * This helps us know which backend server
     * handled the request.
     */
    const healthData = {
      // Server is alive
      status: "UP",

      // Short message
      message: "CloudNest Backend is healthy",

      // Current time
      timestamp: new Date(),

      // How long this backend has been running
      uptime: process.uptime(),

      /**
       * --------------------------------------------------------
       * Server Information
       * --------------------------------------------------------
       *
       * This section is mainly used while testing
       * Nginx Load Balancing.
       *
       * When requests alternate between VM1 and VM2,
       * the hostname below will change.
       */
      server: {
        hostname: os.hostname(),

        ip: req.socket.localAddress,

        port: process.env.PORT,

        nodeVersion: process.version,

        platform: process.platform,
      },

      /**
       * --------------------------------------------------------
       * Database Status
       * --------------------------------------------------------
       */
      database: {
        status: dbStatusMap[dbState] || "unknown",

        connectionState: dbState,
      },

      /**
       * --------------------------------------------------------
       * System Information
       * --------------------------------------------------------
       */
      system: {
        memory: process.memoryUsage(),

        cpuUsage: process.cpuUsage(),
      },
    };

    return ApiResponse.success(
      res,
      healthData,
      "System health retrieved successfully"
    );
  })
);

export default router;