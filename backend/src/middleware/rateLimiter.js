import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import ApiResponse from "../utils/apiResponse.js";

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, _options) => {
    return ApiResponse.error(
      res,
      `Too many requests. Please try again after ${Math.ceil(env.RATE_LIMIT_WINDOW_MS / 60000)} minutes.`,
      429
    );
  },
});

export default rateLimiter;
