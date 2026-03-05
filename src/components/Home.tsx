import { useEffect } from "react";
import MovieCard from "./MovieCard";
import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";
import { useMovieStore } from "../store/useMovieStore";

function Home() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    fetchSearchResults,
    topRatedMovies,
    fetchTopRatedMovies,
    upcomingMovies,
    fetchUpcomingMovies,
    popularMovies,
    fetchPopularMovies,
  } = useMovieStore();

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, fetchSearchResults]);

  useEffect(() => {
    if (topRatedMovies.length === 0) fetchTopRatedMovies(1);
    if (upcomingMovies.length === 0) fetchUpcomingMovies(1);
    if (popularMovies.length === 0) fetchPopularMovies(1);
  }, [topRatedMovies.length, upcomingMovies.length, popularMovies.length, fetchTopRatedMovies, fetchUpcomingMovies, fetchPopularMovies]);

  // Limit the displayed movies on the home page to 15 per section
  const displayedTopRatedMovies = topRatedMovies.slice(0, 15);
  const displayedUpcomingMovies = upcomingMovies.slice(0, 15);
  const displayedPopularMovies = popularMovies.slice(0, 15);

  return (
    <div className="bg-black text-white flex flex-col items-center min-h-screen px-4 py-20">
      {/* Search Bar */}
      <div className="flex flex-col items-center w-full ">
        <div className="w-full max-w-lg my-8">
          <SearchBar
            searchMovies={searchQuery}
            setSearchMovies={setSearchQuery}
            onSearch={fetchSearchResults}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {searchQuery ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {searchResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <>
            {/* UPCOMING MOVIES - Horizontal Scroll */}
            <div className="my-10">
              <h1 className="text-3xl text-blue-300 font-semibold text-center p-2">
                Upcoming Movies
              </h1>
              <div className="md:px-5 flex flex-row my-5 max-w-full items-center overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-500/20 scrollbar-track-gray-900/90 md:pb-3">
                {displayedUpcomingMovies.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-56 md:w-64 mr-4">
                    <MovieCard movie={movie} />
                  </div>
                ))}
                {/* "See More" button */}
                <Link to="/movies/upcoming-movies" className="flex-shrink-0">
                  <button className="text-white bg-zinc-800 hover:bg-zinc-700 font-bold py-2 px-6 rounded-full shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105">
                    See More
                  </button>
                </Link>
              </div>
            </div>

            {/* TOP RATED MOVIES - Horizontal Scroll */}
            <div className="my-10">
              <h1 className="text-3xl text-blue-300 font-semibold text-center p-2">
                Top Rated Movies
              </h1>
              <div className="md:px-5 flex flex-row my-5 max-w-full items-center overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-500/20 scrollbar-track-gray-900/90 md:pb-3">
                {displayedTopRatedMovies.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-56 md:w-64 mr-4">
                    <MovieCard movie={movie} />
                  </div>
                ))}
                {/* "See More" button */}
                <Link to="/movies/top-rated" className="flex-shrink-0">
                  <button className="text-white bg-zinc-800 hover:bg-zinc-700 font-bold py-2 px-6 rounded-full shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105">
                    See More
                  </button>
                </Link>
              </div>
            </div>

            {/* POPULAR MOVIES - Horizontal Scroll */}
            <div className="my-10">
              <h1 className="text-3xl text-blue-300 font-semibold text-center p-2">
                Popular Movies
              </h1>
              <div className="md:px-5 flex flex-row my-5 max-w-full items-center overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-500/20 scrollbar-track-gray-900/90 md:pb-3">
                {displayedPopularMovies.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-56 md:w-64 mr-4">
                    <MovieCard movie={movie} />
                  </div>
                ))}
                {/* "See More" button */}
                <Link to="/movies/popular" className="flex-shrink-0">
                  <button className="text-white bg-zinc-800 hover:bg-zinc-700 font-bold py-2 px-6 rounded-full shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105">
                    See More
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
