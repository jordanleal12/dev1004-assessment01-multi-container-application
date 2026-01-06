// What do we need

// We need to get counts of reelProgress docs
//

/* Leaderboard:
User data
find length of how many array of (reelProgress - ALL watched movies)
sort by desc (higher to lower)
return response
*/

import User from '../models/User';

export const getLeaderboard = async (req, response, next) => {
  // Set variable for current datetime, so we can see when it was last updated
  const now = Date();
  try {
    // Use aggregate function to group by user
    const reelProgressData = await User.aggregate([
      {
        $match: { reelProgress: { $exists: true, $ne: [] } },
      },
      {
        $group: {
          // Groups using username as ID
          _id: '$username',
          // Sums the number of reelProgress documents for that user
          reelProgressCount: { $sum: { $size: '$reelProgress' } },
        },
      },
      // Sorts the results by reelProgressCount in desc order (highest first)
      { $sort: { reelProgressCount: -1 } },
    ]);

    return response.status(200).json({
      success: true, // expect response.body.succuess toBe true
      message:
        reelProgressData.length === 0
          ? 'Leaderboard is empty - no users with reel progress yet'
          : `Found ${reelProgressData.length} users with Reel Progress`,
      reelProgressData, // expect response.body.data.length > 0 / or has this property
      updatedAt: now, // expect response.body toHaveProperty updatedAt
    });
  } catch (error) {
    return next(error);
  }
};

export default getLeaderboard;
