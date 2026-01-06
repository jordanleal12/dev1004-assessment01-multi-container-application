import { Router } from 'express';
import {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  deleteUserProfile,
} from '../controllers/UserController';
import { verifyToken, requireAdmin } from '../utils/auth';
// import User from '../models/User';

const router = Router();

// Get all users
router.get('/', verifyToken, getAllUsers);

// Get current user profile
router.get('/my-profile', verifyToken, getUserProfile);

// Get user profile by ID (for viewing other users' profiles)
router.get('/:userId', verifyToken, requireAdmin, getUserProfile);

// // Add get user(s) by username query
// router.get('/username/', verifyToken, getUserProfileByName);

// Update current user profile
router.put('/my-profile', verifyToken, updateUserProfile);

// Update another user's profile (admin only - with userId param)
router.put('/:userId', verifyToken, requireAdmin, updateUserProfile);

// Update current user password
router.put('/my-profile/update-password', verifyToken, updateUserPassword);

// // Update another user's password (admin only - with userId param) (commented out for future discussion)
// router.put('/:userId/update-password', verifyToken, requireAdmin, updateUserPassword);

// Delete current user profile
router.delete('/my-profile', verifyToken, deleteUserProfile);

// Delete another user's profile (admin only - with userId param)
router.delete('/:userId', verifyToken, requireAdmin, deleteUserProfile);

export default router;
