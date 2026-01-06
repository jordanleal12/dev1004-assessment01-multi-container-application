import { Router } from 'express';

import { getLeaderboard } from '../controllers/LeaderboardController';

const router = Router();

// Get Leaderboard for all users reelProgress data
// (Updates on manual refresh at this stage)
router.get('/', getLeaderboard);

export default router;
