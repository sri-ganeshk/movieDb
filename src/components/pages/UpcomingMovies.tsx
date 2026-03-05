import React, { useEffect, useRef, useCallback } from 'react';
import MovieCard from '../MovieCard';
import { useMovieStore } from '../../store/useMovieStore';

const UpcomingMovies = () => {
  const { upcomingMovies, upcomingPage, fetchUpcomingMovies } = useMovieStore();
  const observer = useRef<IntersectionObserver | null>(null);
  const hasMore = upcomingMovies.length >= upcomingPage * 20;

  const lastMovieElementRef = useCallback(
    (node: any) => {
      if (observer.current) (observer.current as IntersectionObserver).disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchUpcomingMovies(upcomingPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, upcomingPage, fetchUpcomingMovies]
  );

  useEffect(() => {
    if (upcomingMovies.length === 0) {
        fetchUpcomingMovies(1);
    }
  }, [upcomingMovies.length, fetchUpcomingMovies]);

  return (
    <div className="px-6 py-20">
      <h1 className="text-3xl md:text-5xl font-bold text-center text-white mb-8">
        Upcoming Movies
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {upcomingMovies.map((movie, index) => {
          if (upcomingMovies.length === index + 1) {
            return (
              <div ref={lastMovieElementRef} key={movie.id}>
                <MovieCard movie={movie} />
              </div>
            );
          } else {
            return <MovieCard key={movie.id} movie={movie} />;
          }
        })}
      </div>
    </div>
  );
};

export default UpcomingMovies;
