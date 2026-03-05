import React, { useEffect, useRef, useCallback } from 'react';
import MovieCard from '../MovieCard';
import { useMovieStore } from '../../store/useMovieStore';

const TopRatedMovies = () => {
  const { topRatedMovies, topRatedPage, fetchTopRatedMovies } = useMovieStore();
  const observer = useRef<IntersectionObserver | null>(null);
  const hasMore = topRatedMovies.length >= topRatedPage * 20;

  const lastMovieElementRef = useCallback(
    (node: any) => {
      if (observer.current) (observer.current as IntersectionObserver).disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchTopRatedMovies(topRatedPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, topRatedPage, fetchTopRatedMovies]
  );

  useEffect(() => {
    if (topRatedMovies.length === 0) {
        fetchTopRatedMovies(1);
    }
  }, [topRatedMovies.length, fetchTopRatedMovies]);

  return (
    <div className="px-6 py-20">
      <h1 className="text-3xl md:text-5xl font-bold text-center text-white mb-8">
        Top Rated Movies
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topRatedMovies.map((movie, index) => {
          if (topRatedMovies.length === index + 1) {
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

export default TopRatedMovies;
