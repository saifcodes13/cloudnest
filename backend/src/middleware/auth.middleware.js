import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/user.model.js";
import AppError from "../utils/customError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Protect middleware to secure routes and verify JWT tokens
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1) Retrieve token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to get access.", 401));
  }

  // 2) Verify token signature
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid session token. Please log in again.", 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user belonging to this session no longer exists.", 401));
  }

  // 4) Check if user is suspended
  if (currentUser.isSuspended) {
    return next(new AppError("Your account has been suspended. Please contact support.", 403));
  }

  // 5) Grant access: mount user on req
  req.user = currentUser;
  next();
});

/**
 * RBAC middleware to restrict access to specific roles (e.g. admin)
 * @param  {...string} roles - Authorized user roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};

export default protect;
