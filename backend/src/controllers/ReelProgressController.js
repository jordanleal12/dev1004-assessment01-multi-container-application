import Movie from '../models/Movie';
import User from '../models/User';

// CRUD FUNCTIONS FOR REELPROGRESS

// Create reelProgress record (user)
export const createReelProgress = async (request, response, next) => {
  try {
    // set up the userId using JWT token
    const { userId } = request.user;
    // Get movie data from the request body (validated by helper function)
    const reelData = request.body;

    // Check if the movie with supplied id exists
    const movie = await Movie.findById(reelData.movie);
    if (!movie) {
      return response.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Check if movie already exists in user's reelProgress
    const existingReelProgress = await User.findOne({
      _id: userId,
      'reelProgress.movie': reelData.movie,
    });

    // IF Movie is already in reelProgress - prevents duplicates
    if (existingReelProgress) {
      return response.status(409).json({
        success: false,
        message: 'Movie already in your reel',
      });
    }

    // Add new record (only if it doesn't exist)
    await User.findByIdAndUpdate(
      userId,
      { $push: { reelProgress: reelData } },
      { new: true, runValidators: true },
    );

    return response.status(201).json({
      success: true,
      message: `${movie.title} added to your Reel Progress`,
      addedMovieId: reelData.movie,
    });
  } catch (error) {
    return next(error);
  }
};

export const getReelProgress = async (request, response, next) => {
  try {
    // attach the user from the JWT
    const { userId } = request.user;

    // Select only the relevant data for the response
    const userData = await User.findById(userId).select(
      'reelProgress.movie reelProgress.rating reelProgress.isWatched',
    );

    // Check the user has reelProgress records
    if (userData.reelProgress.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'No Reel Progress records found',
      });
    }

    // Return entire array to the front end
    return response.status(200).json({
      success: true,
      message: 'Reel Progress records found',
      reelProgress: userData.reelProgress, // ← Get the array from first result
    });
  } catch (error) {
    return next(error);
  }
};

// Get a single reelProgress record (user) is not needed for any front end purposes

// Update reelprogress record (rating - user)
export const updateReelProgress = async (request, response, next) => {
  try {
    // User attached from JWT
    const { userId } = request.user;
    // movieId sent as request param :movieId
    const { movieId } = request.params;
    // Only expected field of "rating" taken from JSON body
    const { rating } = request.body;

    // Check if rating is provided (not simple truthy v falsy as updating to null is applicable)
    if (rating === undefined) {
      return response.status(400).json({
        success: false,
        message: 'Rating is required',
      });
    }

    // Update the specific movie's rating in the user's reelProgress
    const userReelProgress = await User.findOneAndUpdate(
      {
        _id: userId,
        'reelProgress.movie': movieId,
      },
      {
        $set: {
          'reelProgress.$.rating': rating,
        },
      },
      {
        runValidators: true,
      },
    );

    // If the user has no reel progress record for that movie:
    if (!userReelProgress) {
      return response.status(404).json({
        success: false,
        message: 'Movie not found in your Reel Progress',
      });
    }

    // Upon success:
    return response.status(200).json({
      success: true,
      message: 'Rating updated',
      newRating: rating,
    });
    // Unexpected errors passed to error handler
  } catch (error) {
    return next(error);
  }
};

// Delete reelProgress record (user)
export const deleteReelProgress = async (request, response, next) => {
  try {
    // User attached from JWT token
    const { userId } = request.user;
    // Movie id passed as request param :movieId
    const { movieId } = request.params;

    // Find the reel progress if it exists
    const reelToDelete = await User.findOne({
      _id: userId,
      'reelProgress.movie': movieId,
    });

    // IF it doesn't exist:
    if (!reelToDelete) {
      return response.status(404).json({
        success: false,
        message: 'Movie not found in your Reel Progress',
      });
    }

    // Only executes if the movie exists, NOT findOneAndDelete, this will delete the entire USER record
    // We use $pull instead
    await User.findOneAndUpdate(
      // User id passed from JWT
      {
        _id: userId,
      },
      // $pull deletes ONLY the sub document
      {
        $pull: {
          reelProgress: { movie: movieId },
        },
      },
    );

    // On success:
    return response.status(200).json({
      success: true,
      message: 'Reel Progress record deleted successfully',
    });
    // Unexpected errors passed to  the error handler
  } catch (error) {
    return next(error);
  }
};

// Get reelProgress records (all - admin)
export const adminGetAllReels = async (request, response, next) => {
  try {
    // Big aggregate function basically gets everything in the format that admin would require with only necessary data
    const reelProgressData = await User.aggregate([
      // Filters out users with NO reelProgress records
      { $unwind: '$reelProgress' },
      // Gets all fields and values required for response
      {
        $lookup: {
          from: 'movies',
          localField: 'reelProgress.movie',
          foreignField: '_id',
          as: 'movieDetails',
          pipeline: [{ $project: { title: 1, year: 1 } }],
        },
      },
      // Filters out any empty movieDetails arrays (if a movie is deleted from the database it won't be shown here) for edge cases
      { $unwind: '$movieDetails' },
      // Formats the returned aggregate data into a more readable/clean format
      {
        $group: {
          _id: '$_id', // userId comes up first
          username: { $first: '$username' }, // then username
          reelProgress: {
            $push: {
              movieDetails: '$movieDetails', // then movie title and year
              rating: '$reelProgress.rating', // then rating (if any)
              isWatched: '$reelProgress.isWatched', // then isWatched status (technically not required but just in case)
            },
          },
        },
      },
    ]);

    return response.status(200).json({
      success: true,
      reelProgressData,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete reelProgress record (any-user admin)
export const adminDeleteReelProgress = async (request, response, next) => {
  try {
    // Get userId and movieID from request params
    const { userId, movieId } = request.query;

    // Check both query params are received in request
    if (!userId || !movieId) {
      return response.status(400).json({
        success: false,
        message: 'Both userId and movieId query parameters required',
      });
    }

    // Check if user exists first
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        message: `User not found with id: ${userId}`,
      });
    }

    // Then check for reelProgress record:
    const userReel = user.reelProgress.some((progress) => progress.movie.toString() === movieId);

    // IF it doesn't exist:
    if (!userReel) {
      return response.status(404).json({
        success: false,
        message: `User has no Reel Progress record for movie with id: ${movieId}`,
      });
    }

    // Only executes if the record exists: ...AndUpdate not ...AndDelete, delete would delete the user record
    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      { $pull: { reelProgress: { movie: movieId } } }, // $Pull again, deletes the subrecord not the user record
    );

    // IF successful:
    return response.status(200).json({
      success: true,
      message: 'User Reel Progress record deleted successfully',
    });
    // Unexpected errors passed to the error handler
  } catch (error) {
    return next(error);
  }
};
// Delete orphaned reelProgress records (any reelProgress records for movies which no longer exist in the database)
// database cleanup could be added later not implemented at this stage of development
