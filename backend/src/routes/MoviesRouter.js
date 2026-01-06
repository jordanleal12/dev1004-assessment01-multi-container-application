import { Router } from 'express';
import {
  createMovie,
  deleteMovie,
  getMovie,
  getReelCanon,
  searchMovie,
  updateMoviePosterUrl,
} from '../controllers/MovieController';
import { requireAdmin, verifyToken } from '../utils/auth';

const router = Router();

// Get reelCanon movies for any user, login not required
router.get('/reel-canon', getReelCanon);

// Authorized search route to return movie by title using query (movies/search?title=Inception)
router.get('/search', verifyToken, searchMovie);

// Authorized search route to get movie by imdbId parameter (movies/<someRandomId>)
router.get('/:imdbId', verifyToken, getMovie);

// Authorized route to create non reelCanon movies
router.post('/', verifyToken, createMovie);

// Admin only route to update movie poster URL's using imdbId parameter and body
// (movies/<someRandomId>), { poster: '<newPosterUrl>' }
router.patch('/:imdbId', verifyToken, requireAdmin, updateMoviePosterUrl);

// Authorized route to delete non reel-canon movie by imdbId parameter (movies/<someRandomId>)
router.delete('/:imdbId', verifyToken, deleteMovie);

export default router;
