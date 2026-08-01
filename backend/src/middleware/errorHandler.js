import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import ApiResponse from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, _next) => {
  if (err.name === "MulterError") {
    err.statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    err.isOperational = true;
    err.message = err.code === "LIMIT_FILE_SIZE"
      ? "File is too large. Maximum allowed size is 100MB."
      : `Upload error: ${err.message}`;
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

const sendErrorDev = (err, res) => {
  logger.error(`[Dev Error]: ${err.message}`, err);
  return ApiResponse.error(res, err.message, err.statusCode, {
    stack: err.stack,
    details: err.details,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.warn(`[Operational Error]: ${err.message}`);
    return ApiResponse.error(res, err.message, err.statusCode, err.details);
  }

  // Programming or other unknown error: don't leak details to client
  logger.error("[System/Programming Error]:", err);
  return ApiResponse.error(res, "Internal server error. Please try again later.", 500);
};

export default errorHandler;
