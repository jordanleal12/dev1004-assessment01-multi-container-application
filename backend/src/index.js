import { app, HOST, PORT, databaseURL, connectToDatabase } from './server';

// Only connect to database if not in test environment (tests use different db setup)
if (process.env.NODE_ENV !== 'test') await connectToDatabase(databaseURL);

// Start the server to listen for requests
app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
