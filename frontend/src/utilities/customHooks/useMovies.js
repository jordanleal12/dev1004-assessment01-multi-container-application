import { useQuery } from "@tanstack/react-query";
import { getAllMovies, getMovieByTitle, getMovieByImdbId } from "../services/apiServices";

// Create tanstack query custom hook to get all movies
// useQuery calls your function (getAllMovies), returns { data, isLoading, error etc. }
export const useAllMovies = () =>
  useQuery({
    queryKey: ["all-movies"],
    queryFn: getAllMovies,
  });

// Create tanstack custom hook to get single movie by title query
export const useMovieByTitle = (title) =>
  useQuery({
    // Having 'title' var in array means different cache entry is provided for unique titles
    queryKey: ["movie-from-title", title],
    queryFn: () => getMovieByTitle(title),
  });

// Create tanstack custom hook to get single movie by IMDB ID
export const useMovieByImdbId = (imdbId) =>
  useQuery({
    // Having 'imdbId' var in array means different cache entry is provided for unique ids
    queryKey: ["movie-from-imdbId", imdbId],
    queryFn: () => getMovieByImdbId(imdbId),
  });
