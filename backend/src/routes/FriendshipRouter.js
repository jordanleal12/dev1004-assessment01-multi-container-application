import { Router } from 'express';
import { verifyToken, requireAdmin } from '../utils/auth';
import {
  getAllFriendships,
  getUserFriendships,
  createFriendship,
  updateFriendship,
  removeFriendship,
} from '../controllers/FriendshipController';

const router = Router();

// Admin route to get all friendships - for admin overview purposes
router.get('/', verifyToken, requireAdmin, getAllFriendships);

// Get list of friends for the authenticated logged in user
router.get('/my-friends', verifyToken, getUserFriendships);

// Get list of friends for a specific user by userId (admin only)
router.get('/:userId', verifyToken, requireAdmin, getUserFriendships);

// Create a friendship
router.post('/:recipientUserId', verifyToken, createFriendship);

// Update friendships
router.put('/my-friends/:requesterUserId', verifyToken, updateFriendship);

// Update friendships for a specific user by userId (admin only)
router.put('/', verifyToken, requireAdmin, updateFriendship);

// Remove an existing friendship (unfriend)
router.delete('/my-friends/:otherUserId', verifyToken, removeFriendship);

// Remove an existing friendship for a specific user by userId (admin only)
router.delete('/', verifyToken, requireAdmin, removeFriendship);

export default router;
