import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import toast from 'react-hot-toast';

interface MovieDetails {
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits: {
    crew: { job: string; name: string; profile_path: string }[];
    cast: { cast_id: number; name: string; profile_path: string; character: string }[];
  };
  videos: {
    results: { type: string; key: string }[];
  };
}

interface Recommendation {
  id: number;
  title: string;
  poster_path: string;
}

interface Review {
  id: string;
  author: string;
  author_details: { avatar_path: string | null };
  content: string;
  created_at: string;
}

const Movie = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visibleReviews, setVisibleReviews] = useState(2);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const movieId = Number(id);
  const isMovieFavorite = isFavorite(movieId);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get('/api/tmdb', {
          params: {
            endpoint: `movie/${id}`,
            append_to_response: 'credits,videos',
          },
        });
        setMovieDetails(response.data);

        const [recsRes, reviewsRes] = await Promise.all([
          axios.get('/api/tmdb', { params: { endpoint: `movie/${id}/recommendations` } }),
          axios.get('/api/tmdb', { params: { endpoint: `movie/${id}/reviews` } }),
        ]);
        setRecommendations(recsRes.data.results || []);
        setReviews(reviewsRes.data.results || []);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        toast.error('Failed to load movie details. Please try again.');
      }
    };
    fetchMovieDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isMovieFavorite) {
        await removeFavorite(movieId);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(movieId);
        toast.success('Added to favorites ❤️');
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Error updating favorites.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (!movieDetails) {
    return <div className="text-center text-white min-h-screen bg-black flex items-center justify-center">Loading...</div>;
  }

  const director = movieDetails.credits.crew.find((p) => p.job === 'Director');
  const cast = movieDetails.credits.cast;
  const trailer = movieDetails.videos.results.find((v) => v.type === 'Trailer');
  const rating = movieDetails.vote_average;
  const stars = Math.round(rating / 2);

  const fallbackImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return fallbackImage;
    if (avatarPath.startsWith('/https')) return avatarPath.replace('/https', 'https');
    return `https://image.tmdb.org/t/p/w500${avatarPath}`;
  };

  const getWikipediaLink = (name: string) =>
    `https://en.wikipedia.org/wiki/${name.split(' ').join('_')}`;

  return (
    <div className="md:ml-0 py-20 bg-black min-h-screen">
      {/* Backdrop */}
      <div className="relative h-auto md:h-[82vh] flex justify-center">
        <div className="h-full w-full shadowbackdrop absolute"></div>
        <h1 className="text-white absolute bottom-0 p-10 text-2xl md:text-6xl font-bold text-center">
          {movieDetails.title}
        </h1>
        <img
          src={`https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`}
          alt={movieDetails.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Rating */}
      <div className="flex justify-center items-center mt-5">
        <div className="flex items-center space-x-2">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-6 h-6 ${index < stars ? 'text-yellow-400' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049.867L7.527 6.317H2.3L6.18 9.013 4.664 14.567 9.049 11.608 13.436 14.567 11.92 9.013 15.799 6.317h-5.226L9.049.867z" />
            </svg>
          ))}
          <p className="text-white text-lg">{rating.toFixed(1)}/10</p>
        </div>
      </div>

      {/* Overview */}
      <h2 className="text-white text-center pt-5 px-3 md:px-60 text-[18px]">
        {movieDetails.overview}
      </h2>

      {/* Release Date */}
      <div className="text-blue-100 font-semibold my-3 flex justify-center">
        <h2 className="bg-blue-600/30 border-2 border-blue-700 py-2 px-3 rounded-full">
          Release Date: {movieDetails.release_date}
        </h2>
      </div>

      {/* Genres */}
      <div className="flex justify-center flex-wrap">
        {movieDetails.genres.map((genre) => (
          <div key={genre.id} className="text-white font-semibold bg-gray-800 rounded-full px-4 py-1 m-2">
            {genre.name}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center my-8 gap-5 flex-wrap">
        {trailer && (
          <a
            href={`https://www.youtube.com/watch?v=${trailer.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex border-2 border-red-600 bg-red-600/40 p-3 items-center justify-center gap-2 text-xl font-semibold rounded-full text-white"
          >
            ▶ Watch Trailer
          </a>
        )}

        <button
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className={`flex border-2 p-3 items-center justify-center gap-2 text-xl font-semibold rounded-full text-white transition ${
            isMovieFavorite
              ? 'border-pink-600 bg-pink-600/40 hover:bg-pink-600/60'
              : 'border-gray-600 bg-gray-600/40 hover:bg-gray-600/60'
          }`}
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12 4.248c-3.148-5.402-12-3.735-12 2.944 0 4.713 5.373 7.431 12 15.048 6.627-7.617 12-10.335 12-15.048 0-6.679-8.852-8.346-12-2.944z" />
          </svg>
          {isMovieFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>

      {/* Director */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl text-blue-300 font-semibold text-center p-2">Director</h1>
        {director && (
          <a
            href={getWikipediaLink(director.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-[9rem] md:min-w-[10rem] max-w-[9rem] md:max-w-[10rem] h-full items-center text-center flex-col mx-1 cursor-pointer"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${director.profile_path}`}
              alt={director.name}
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
              className="w-full h-[14rem] object-cover rounded-xl transition-transform duration-300 hover:scale-105"
            />
            <p className="text-white mt-2">{director.name}</p>
          </a>
        )}

        {/* Cast */}
        <h1 className="text-3xl text-blue-300 font-semibold text-center p-2 mt-6">Cast</h1>
        <div className="md:px-5 flex flex-row my-5 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500/20 scrollbar-track-gray-900/90 md:pb-3">
          {cast.map((member) => (
            <a
              key={member.cast_id}
              href={getWikipediaLink(member.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-[9rem] md:min-w-[10rem] max-w-[9rem] md:max-w-[10rem] h-full items-center text-center flex-col mx-1 cursor-pointer"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                alt={member.name}
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                className="w-full h-[14rem] object-cover rounded-xl transition-transform duration-300 hover:scale-105"
              />
              <p className="text-white mt-2">{member.name}</p>
              <p className="text-gray-400 text-sm">{member.character}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="my-10 px-4 md:px-20">
          <h1 className="text-3xl text-blue-300 font-semibold text-center p-2">Reviews</h1>
          <div className="flex flex-col gap-4 mt-4">
            {reviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={getAvatarUrl(review.author_details?.avatar_path)}
                    alt={review.author}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-semibold">{review.author}</p>
                    <p className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-4">{review.content}</p>
              </div>
            ))}
          </div>
          {visibleReviews < reviews.length && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleReviews((v) => v + 2)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full transition"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="my-10">
        <h1 className="text-3xl text-blue-300 font-semibold text-center p-2">Recommended Movies</h1>
        <div className="md:px-5 flex flex-row my-5 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500/20 scrollbar-track-gray-900/90 md:pb-3">
          {recommendations.length > 0 ? (
            recommendations.map((movie) => (
              <a
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="flex min-w-[9rem] md:min-w-[10rem] max-w-[9rem] md:max-w-[10rem] h-full items-center text-center flex-col mx-1 cursor-pointer"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                  className="w-full h-[20rem] max-w-[14rem] object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                />
                <p className="text-white mt-2">{movie.title}</p>
              </a>
            ))
          ) : (
            <p className="text-white text-center w-full">No recommendations available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movie;
