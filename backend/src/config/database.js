// Keeping database connection logic as functions in a separate file allows easy reuse and testing
import mongoose from 'mongoose';

// Function to connect to database
async function databaseConnector(databaseURL) {
  await mongoose.connect(databaseURL);
}

// Function to disconnect from database
async function databaseDisconnector() {
  await mongoose.disconnect();
}

export { databaseConnector, databaseDisconnector };
