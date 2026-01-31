import express from 'express';
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * Authentication Routes
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login - Login user
 * POST /api/auth/refresh-token - Refresh access token
 * POST /api/auth/logout - Logout user
 * GET /api/auth/me - Get current user (protected)
 * PUT /api/auth/profile - Update user profile (protected)
 * POST /api/auth/change-password - Change password (protected)
 */

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, upload.single('profileImage'), updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
