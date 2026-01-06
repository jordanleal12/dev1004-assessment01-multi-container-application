import mongoose, { Schema } from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: 200,
    },
    year: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    genre: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    plot: {
      type: String,
      maxlength: 1000,
    },
    actors: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    imdbId: {
      type: String,
      required: true,
      unique: true,
      match: /^tt\d+$/, // Validates the id is tt followed by numbers
    },
    poster: {
      type: String,
      required: true,
    },
    isReelCanon: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

// Pre hook protects against any movie with isReelCanon set to true being deleted deleted
movieSchema.pre('deleteOne', { document: true }, function preDeleteHook(next) {
  // if isReelCanon is truthy (only true is truthy out of possible options)
  if (this.isReelCanon) {
    return next(new Error('Reel Canon movies cannot be deleted')); // Send this error message
  }
  return next(); // Otherwise delete
});

// Protects against bulk deletes for future implementation
movieSchema.pre('deleteMany', function preBulkDeleteHook(next) {
  // Find all movies which match the bulk delete filter (if any)
  this.model
    .find(this.getFilter())
    .then((movies) => {
      // Checks if any of the found movies have truthy isReelCanon
      const hasReelCanon = movies.some((movie) => movie.isReelCanon);

      // IF any of the movies are in the reel canon, block the bulk delete
      if (hasReelCanon) {
        return next(new Error('cannot delete Reel Canon movies'));
      }
      // IF no Reel Canon movies, proceed with delete
      return next();
    })
    // IF any errors, pass it to the error handler
    .catch(next);
});

export default mongoose.model('Movie', movieSchema);
