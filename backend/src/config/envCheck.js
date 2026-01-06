/* eslint-disable no-console */
export const validateEnv = () => {
  // CRITICAL application env variables, the app will not run without these
  const required = ['JWT_SECRET_KEY', 'TOKEN_HEADER_KEY'];
  // DATABASE_URI is not required for tests since they use mongodb-memory-server
  if (process.env.NODE_ENV !== 'test') {
    required.push('DATABASE_URI');
  }
  const missing = required.filter((env) => !process.env[env]);

  // IF anything required is in the missing array, alert and stop the server running
  if (missing.length > 0) {
    console.error('CRITICAL: Missing required environment variables: ');
    missing.forEach((env) => console.error(`  - ${env}`)); // Tells us which variables are missing
    process.exit(1);
  }

  // Important but not application breaking env variables, API KEY only used for seeding, or adding new movies (not implemented in v.0.1)
  const important = ['OMDB_API_KEY'];
  const missingImportant = important.filter((env) => !process.env[env]);

  // IF anything important is in the missing array, warn in the console, but continue running the server
  if (missingImportant.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(' DEVELOPMENT: Missing important environment variables');
    missingImportant.forEach((env) => console.warn(`  - ${env} (some features disabled)`)); // Tells us which variables are missing and the impact, but app will run
  }

  // Security checks that JWT secret key is not a standard variable or example
  if (process.env.NODE_ENV === 'production') {
    if (
      process.env.JWT_SECRET_KEY.includes('example') ||
      process.env.JWT_SECRET_KEY === 'your_secret_key_here'
    ) {
      console.error('SECURITY ERROR: Change JWT_SECRET_KEY in production!'); // Reminder to set up proper key, stops server running, an example JWT Key cannot ever run in production
      process.exit(1);
    }
  }
};

export default validateEnv;
