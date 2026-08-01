import { Router } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import websiteRouter from "./website.routes.js";
import { env } from "../config/env.js";
import ApiResponse from "../utils/apiResponse.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/websites", websiteRouter);

router.get("/config", (req, res) => {
  return ApiResponse.success(
    res,
    {
      baseDomain: env.BASE_DOMAIN,
      protocol: env.PROTOCOL,
    },
    "Configuration retrieved successfully"
  );
});

export default router;
