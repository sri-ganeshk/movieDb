import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';

const MovieCard = ({ movie }: any) => {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const navigate = useNavigate();

  const isMovieFavorite = isFavorite(movie.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isMovieFavorite) {
        await removeFavorite(movie.id);
      } else {
        await addFavorite(movie.id);
      }
    } catch (err) {
      alert(typeof err === 'string' ? err : 'Error updating favorites.');
    }
  };

  const ratingColor = () => {
    const score = movie.vote_average ?? 0;
    if (score >= 7) return 'bg-green-600';
    if (score >= 5) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="relative h-full w-full bg-black/30 flex justify-center items-center p-4 rounded-lg shadow-lg m-4 transition transform hover:scale-105">
      <Link to={`/movie/${movie.id}`} className="flex flex-col items-center">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="rounded-lg shadow-lg w-full h-auto"
        />
        <div className="text-white text-center mt-4">
          <h2 className="text-lg font-bold">{movie.title}</h2>
        </div>
      </Link>

      {/* Favorite Toggle Button */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-2 left-2 text-white font-bold text-lg p-2 rounded-full transition duration-300 z-10 ${
          isMovieFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-red-600'
        }`}
      >
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          height="1em"
          width="1em"
        >
          <path d="M12 4.248c-3.148-5.402-12-3.735-12 2.944 0 4.713 5.373 7.431 12 15.048 6.627-7.617 12-10.335 12-15.048 0-6.679-8.852-8.346-12-2.944z" />
        </svg>
      </button>

      {/* Rating Badge */}
      <div
        className={`absolute top-2 right-2 text-white font-bold text-sm w-8 h-8 flex justify-center items-center rounded-full ${ratingColor()}`}
      >
        {(movie.vote_average ?? 0).toFixed(1)}
      </div>
    </div>
  );
};

export default MovieCard;
