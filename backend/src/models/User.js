// this is one of the two major ones, users are integral

import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

// this is one of the two major ones, users are integral
const reelProgressSchema = new Schema(
  {
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    isWatched: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// // Compound index ensures no reelProgress entries can be duplicated
// reelProgressSchema.index({ user: 1, movie: 1 }, { unique: true, sparse: true });

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (password) =>
        validator.isStrongPassword(password, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        }),
      message:
        'Password must be at least 8 characters long, and contain: one lowercase letter, one uppercase letter, one number and one special character.',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Please enter a valid email',
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  reelProgress: [reelProgressSchema],
});

userSchema.pre('save', async function hashPassword(next) {
  // Only run if the password is modified (created or updated)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

export default mongoose.model('User', userSchema);
