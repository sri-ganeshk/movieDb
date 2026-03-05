import React, { useEffect, useRef, useCallback } from 'react';
import MovieCard from '../MovieCard';
import { useMovieStore } from '../../store/useMovieStore';

const PopularMovies = () => {
  const { popularMovies, popularPage, fetchPopularMovies } = useMovieStore();
  const observer = useRef<IntersectionObserver | null>(null);
  const hasMore = popularMovies.length >= popularPage * 20;

  const lastMovieElementRef = useCallback(
    (node: any) => {
      if (observer.current) (observer.current as IntersectionObserver).disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPopularMovies(popularPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, popularPage, fetchPopularMovies]
  );

  useEffect(() => {
    if (popularMovies.length === 0) {
        fetchPopularMovies(1);
    }
  }, [popularMovies.length, fetchPopularMovies]);

  return (
    <div className="px-6 py-20">
      <h1 className="text-3xl md:text-5xl font-bold text-center text-white mb-8">
        Popular Movies
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popularMovies.map((movie, index) => {
          if (popularMovies.length === index + 1) {
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

export default PopularMovies;
