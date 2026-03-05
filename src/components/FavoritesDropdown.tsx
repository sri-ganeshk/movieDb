import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavoritesStore } from '../store/useFavoritesStore';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const { favorites, isLoading, error, fetchFavorites, removeFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Show toast when fetch error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const ratingColor = (score: number) => {
    if (score >= 7) return 'bg-green-600';
    if (score >= 5) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const handleRemove = async (movieId: number) => {
    try {
      await removeFavorite(movieId);
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove favorite.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-24">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
        My <span className="text-pink-500">Favorites</span>
      </h1>
      <p className="text-gray-400 text-center mb-10">
        {favorites.length} movie{favorites.length !== 1 ? 's' : ''} saved
      </p>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <svg className="w-20 h-20 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.248c-3.148-5.402-12-3.735-12 2.944 0 4.713 5.373 7.431 12 15.048 6.627-7.617 12-10.335 12-15.048 0-6.679-8.852-8.346-12-2.944z" />
          </svg>
          <p className="text-gray-500 text-xl">No favorites yet.</p>
          <Link
            to="/"
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full transition"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites.map((movie) => (
            <div
              key={movie.id}
              className="relative group bg-zinc-900 rounded-xl overflow-hidden shadow-lg transition transform hover:scale-105"
            >
              <Link to={`/movie/${movie.id}`}>
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://via.placeholder.com/300x450?text=No+Image'
                  }
                  alt={movie.title}
                  className="w-full h-72 object-cover"
                />
                <div className="p-3">
                  <h2 className="text-sm font-semibold truncate">{movie.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {movie.release_date?.split('-')[0] ?? 'N/A'}
                  </p>
                </div>
              </Link>

              {/* Rating Badge */}
              <div
                className={`absolute top-2 right-2 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full ${ratingColor(movie.vote_average)}`}
              >
                {movie.vote_average?.toFixed(1)}
              </div>

              {/* Remove from Favorites Button (visible on hover) */}
              <button
                onClick={() => handleRemove(movie.id)}
                title="Remove from favorites"
                className="absolute top-2 left-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M12 4.248c-3.148-5.402-12-3.735-12 2.944 0 4.713 5.373 7.431 12 15.048 6.627-7.617 12-10.335 12-15.048 0-6.679-8.852-8.346-12-2.944z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
