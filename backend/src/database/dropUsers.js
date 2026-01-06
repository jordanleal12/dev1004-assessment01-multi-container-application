/* eslint-disable no-console */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import the user model
import User from '../models/User';

// allow .env access
dotenv.config();

const DATABASE_URI = process.env.LOCAL_DB_URI;

// Script written will only ever run on dev database
async function dropUsers() {
  // Connect to mongo server, if not available, exit early
  try {
    try {
      await mongoose.connect(DATABASE_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (error) {
      console.error('Database connection failed: ', error);
      process.exit(1);
    }

    if (process.env.NODE_ENV === 'production') {
      console.log(
        'This script cannot run on production database. Please change NODE_ENV to "development"',
      );
      process.exit(1);
    }

    console.log('Dropping users from database...');
    const result = await User.deleteMany({});
    console.log(`Dropped ${result.deletedCount} user records.`);
  } catch (error) {
    console.error('Operation failed: ', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

dropUsers();
