import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Sign a JWT token containing the user ID as payload
 * @param {string} userId - Mongoose user document ID
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export default generateToken;
