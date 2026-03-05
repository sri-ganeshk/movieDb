import { create } from 'zustand';
import axios from 'axios';

interface FavoriteMovie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface FavoritesState {
  favorites: FavoriteMovie[];
  favoriteIds: number[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addFavorite: (movieId: number) => Promise<void>;
  removeFavorite: (movieId: number) => Promise<void>;
  isFavorite: (movieId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteIds: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Get list of saved movie IDs from backend
      const res = await axios.get('/api/favorites');
      const movieIds: number[] = (res.data.favorites || []).map(Number);

      if (movieIds.length === 0) {
        set({ favorites: [], favoriteIds: [], isLoading: false });
        return;
      }

      // Step 2: Fetch TMDB details for each movie ID
      const movieResponses = await Promise.all(
        movieIds.map((id) =>
          axios.get('/api/tmdb', { params: { endpoint: `movie/${id}` } })
        )
      );
      const movies: FavoriteMovie[] = movieResponses.map((r) => r.data);
      set({ favorites: movies, favoriteIds: movieIds, isLoading: false });
    } catch (err) {
      console.error('Error fetching favorites:', err);
      set({ error: 'Failed to load favorites.', isLoading: false });
    }
  },

  addFavorite: async (movieId: number) => {
    try {
      await axios.post('/api/favorites', { movieId: [movieId] });
      set((state) => ({ favoriteIds: [...state.favoriteIds, movieId] }));
      // Re-fetch to get the movie details for the new entry
      await get().fetchFavorites();
    } catch (err: any) {
      console.error('Error adding favorite:', err);
      throw err.response?.data?.message || 'Failed to add favorite.';
    }
  },

  removeFavorite: async (movieId: number) => {
    try {
      await axios.delete('/api/favorites', { data: { movieId } });
      set((state) => ({
        favorites: state.favorites.filter((m) => m.id !== movieId),
        favoriteIds: state.favoriteIds.filter((id) => id !== movieId),
      }));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      throw err.response?.data?.message || 'Failed to remove favorite.';
    }
  },

  isFavorite: (movieId: number) => {
    return get().favoriteIds.includes(movieId);
  },
}));
