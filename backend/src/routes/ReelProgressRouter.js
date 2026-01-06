import { Router } from 'express';
import { requireAdmin, verifyToken } from '../utils/auth';
import {
  adminDeleteReelProgress,
  adminGetAllReels,
  createReelProgress,
  deleteReelProgress,
  getReelProgress,
  updateReelProgress,
} from '../controllers/ReelProgressController';
import { validateReelProgress } from '../utils/validation';

const router = Router();

// User authorized routes

// Get reel progress of logged in user
router.get('/', verifyToken, getReelProgress);

// Add movie to reel progress for logged in user
router.post('/', verifyToken, validateReelProgress, createReelProgress);

// Update rating of movie in reel progress for logged in users
router.patch('/:movieId', verifyToken, validateReelProgress, updateReelProgress);

// Delete movie from reel progress for logged in user
router.delete('/:movieId', verifyToken, deleteReelProgress);

// Admin authorized routes

// Get all reel progress records of all users (admin)
router.get('/admin/', verifyToken, requireAdmin, adminGetAllReels);

// Delete reel progress records by query (admin)
router.delete('/admin/queries', verifyToken, requireAdmin, adminDeleteReelProgress);

export default router;
