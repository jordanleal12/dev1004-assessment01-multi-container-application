export const getFavouriteGenreStats = (userRatings, moviesData) => {
  // Map movie data to an array to parse
  const moviesMap = moviesData.reduce((map, movie) => {
    if (movie && movie._id) {
      map[movie._id] = movie;
    }
    return map;
  }, {});

  // set up some genre tracking objects
  const genreStats = {};

  // For each user rating greater than null (0) passed to the function, add that rating to a tally for that genre:
  userRatings
    .filter((rating) => rating.rating > 0)
    .forEach((rating) => {
      const movie = moviesMap[rating.movie];
      movie?.genre?.forEach((genre) => {
        // Sum genre's total star ratings
        if (!genreStats[genre]) {
          genreStats[genre] = {
            totalStars: 0,
            movieCount: 0,
          };
        }
        genreStats[genre].totalStars += rating.rating;
        genreStats[genre].movieCount += 1;
      });
    });

  // some very math functions, but basically sorts by total movies watched with that
  // genre and then averages the star ratings and returns a formatted string
  return Object.entries(genreStats)
    .sort((a, b) => b[1].movieCount - a[1].movieCount)
    .slice(0, 5)
    .map(([genre, stats], index) => {
      const avgRating = (stats.totalStars / stats.movieCount).toFixed(1);

      return `${index + 1}. ${genre}: ${stats.movieCount} ${stats.movieCount === 1 ? "movie" : "movies"} rated. Average ${avgRating} stars!`;
    });
};
