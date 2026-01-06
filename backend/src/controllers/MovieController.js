import validator from 'validator';
import Movie from '../models/Movie';

// READ controllers
// GET reelCanon movies
export const getReelCanon = async (request, response, next) => {
  try {
    // Find all movies with isReelCanon
    const movies = await Movie.find({ isReelCanon: true });
    return response.status(200).json({
      success: true,
      movies,
    });
    // Pass errors to the error handler
  } catch (error) {
    return next(error);
  }
};

// GET movie by id
export const getMovie = async (request, response, next) => {
  try {
    const { imdbId } = request.params;

    const movie = await Movie.findOne({ imdbId });

    if (!movie) {
      return response.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    return response.status(200).json({
      success: true,
      message: 'Movie found',
      movie,
    });
  } catch (error) {
    return next(error);
  }
};

// GET search movies
export const searchMovie = async (request, response, next) => {
  // Search by title for better UX
  try {
    const { title } = request.query;

    // If no title is supplied
    if (!title) {
      return response.status(400).json({
        success: false,
        message: 'Title search parameter required',
      });
    }

    // Find movie\s with that title
    const movies = await Movie.find({ title });

    // // If no movies are found:
    // if (movies.length === 0) {
    //   return response.status(400).json({
    //     success: false,
    //     message: 'Movie not found',
    //   });
    // }

    // // If only one movie is found:
    // if (movies.length === 1) {
    //   return response.status(200).json({
    //     success: true,
    //     message: 'Movie found',
    //     movie: movies[0],
    //   });
    // }

    // If movie length is over 1 (same title, different movies):
    return response.status(200).json({
      success: true,
      // message: `Found ${movies.length} movies with title "${title}"`,
      message: `Found ${movies.length} movie${movies.length === 1 ? '' : 's'} with title "${title}"`,
      movies,
    });
  } catch (error) {
    return next(error);
  }
};

// CREATE movie - front end can fetch API data from OMDb, supplies it to this function directly
export const createMovie = async (request, response, next) => {
  try {
    // Parse body for movie data
    const movieData = request.body;
    const { userId } = request.user;

    // Force isReelCanon to false for user-created movies
    const sanitizedData = {
      ...movieData,
      isReelCanon: false, // Override any value from request
      createdBy: userId,
    };

    // Create the movie
    const movie = await Movie.create(sanitizedData);

    return response.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
    // Pass any errors to the error handler
  } catch (error) {
    return next(error);
  }
};

// UPDATE movie (only poster url)
export const updateMoviePosterUrl = async (request, response, next) => {
  try {
    // Get the imdbId from the route paramaters (this is an admin function, admins should be using unique imdbId)
    const { imdbId } = request.params;
    // Get the poster url from the body (also ensures all other body content is ignored)
    const { poster } = request.body;

    // Uses the isUrl validator -- as of 24/10/2025 this has moderate security vulnerabilities,
    // but as admins are only users able to access route, no malicious activity is expected
    if (!validator.isURL(poster)) {
      return response.status(400).json({
        success: false,
        message: 'Invalid URL format for poster',
      });
    }

    // Find and update the movie document that matches the imdbId,
    // new: true ensures the new movie document is returned in the response
    const movie = await Movie.findOneAndUpdate({ imdbId }, { $set: { poster } }, { new: true });

    // Check the movie exists
    if (!movie) {
      return response.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }
    // return the new movie object
    return response.status(200).json({
      success: true,
      message: 'Movie poster updated successfully',
      movie,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE movie (flag for isReelCanon checked)
export const deleteMovie = async (request, response, next) => {
  try {
    // Uses the unique imdbId from the request parameters
    const { imdbId } = request.params;
    const { userId } = request.user;

    // Finds the matching movie document
    const movie = await Movie.findOne({ imdbId });

    // If no movie is found:
    if (!movie) {
      return response.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // If the movie is in the Reel Canon:
    // NOTE: the schema level pre hook still saves from direct deleteOne requests made to the database
    // This is a second layer of protection for the canon
    if (movie.isReelCanon) {
      return response.status(403).json({
        success: false,
        message: 'Reel Canon movies cannot be deleted',
      });
    }

    if (movie.createdBy.toString() !== userId) {
      return response.status(403).json({
        success: false,
        message: 'Cannot delete movies created by other users',
      });
    }

    // find the movie and delete if it passes all requirements
    const deletedMovie = await Movie.findOneAndDelete({ imdbId });

    return response.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
      deletedMovie,
    });
    // Pass any errors to the error handler
  } catch (error) {
    return next(error);
  }
};
