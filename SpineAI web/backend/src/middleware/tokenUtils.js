import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.refreshTokenExpire,
  });
};

/**
 * Verify token
 */
export const verifyToken = (token, secret = config.jwtSecret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
