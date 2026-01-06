/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { validateEnv } from '../config/envCheck';
import { connectToDatabase, databaseURL } from '../server';

dotenv.config(); // Make .env data available for use
validateEnv(); // Check all necessary variables are present in the .env file

async function dropDatabase() {
  try {
    await connectToDatabase(databaseURL);
    console.log('Connected to database successfully!');

    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully!');
  } catch (error) {
    console.error('Error clearing database: ', error);
  } finally {
    // Disconnect after operation
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

dropDatabase();
