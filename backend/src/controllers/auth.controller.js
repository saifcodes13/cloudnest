import { z } from "zod";
import User from "../models/user.model.js";
import AppError from "../utils/customError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";

// Input validation schemas using Zod
const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(50),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["user", "admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res, next) => {
  // 1) Validate request body
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    const errorDetails = validation.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );
    return next(new AppError("Validation failed", 400, errorDetails));
  }

  const { name, email, password, role } = validation.data;

  // 2) Check if email is already in use
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email is already registered", 400));
  }

  // 3) Create user record (pre-save hook hashes password)
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || "user",
  });

  // 4) Generate session token
  const token = generateToken(newUser._id);

  // 5) Remove password field from returning payload
  newUser.password = undefined;

  return ApiResponse.success(res, { user: newUser, token }, "User registered successfully", 201);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res, next) => {
  // 1) Validate request body
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    const errorDetails = validation.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );
    return next(new AppError("Validation failed", 400, errorDetails));
  }

  const { email, password } = validation.data;

  // 2) Query user and fetch password hash
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) Check if user is suspended
  if (user.isSuspended) {
    return next(new AppError("Your account has been suspended. Please contact support.", 403));
  }

  // 4) Generate session token
  const token = generateToken(user._id);

  // Remove password field
  user.password = undefined;

  return ApiResponse.success(res, { user, token }, "User logged in successfully");
});

/**
 * Get profile of currently logged-in user
 */
export const getMe = asyncHandler(async (req, res, _next) => {
  const user = req.user;
  return ApiResponse.success(res, { user }, "User profile retrieved successfully");
});
