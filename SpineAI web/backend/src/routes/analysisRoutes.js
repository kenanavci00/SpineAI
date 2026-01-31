import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import {
  createAnalysis,
  createPostureAnalysis,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getAnalysisStats
} from '../controllers/analysisController.js';

const router = express.Router();

/**
 * Analysis Routes
 * POST /api/analyses - Create new spine analysis with X-ray image upload
 * POST /api/analyses/posture - Create new posture analysis with photo upload
 * GET /api/analyses - Get all analyses for current user
 * GET /api/analyses/stats - Get analysis statistics
 * GET /api/analyses/:id - Get specific analysis
 * DELETE /api/analyses/:id - Delete analysis
 */

// Create new spine analysis with image upload
router.post('/', 
  authenticate, 
  upload.single('image'), 
  handleUploadError,
  createAnalysis
);

// Create new posture analysis with photo upload
router.post('/posture', 
  authenticate, 
  upload.single('image'), 
  handleUploadError,
  createPostureAnalysis
);

// Get user's analyses (with pagination)
router.get('/', authenticate, getUserAnalyses);

// Get analysis statistics
router.get('/stats', authenticate, getAnalysisStats);

// Get specific analysis
router.get('/:id', authenticate, getAnalysisById);

// Delete analysis
router.delete('/:id', authenticate, deleteAnalysis);

export default router;
