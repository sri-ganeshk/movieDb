import { create } from 'zustand';
import axios from 'axios';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}


interface MovieStore {
  // Search State
  searchQuery: string;
  searchResults: Movie[];
  setSearchQuery: (query: string) => void;
  fetchSearchResults: () => Promise<void>;

  // Category State
  topRatedMovies: Movie[];
  upcomingMovies: Movie[];
  popularMovies: Movie[];
  
  // Pagination State (for fetching more)
  topRatedPage: number;
  upcomingPage: number;
  popularPage: number;

  fetchTopRatedMovies: (page?: number) => Promise<void>;
  fetchUpcomingMovies: (page?: number) => Promise<void>;
  fetchPopularMovies: (page?: number) => Promise<void>;
}

// Ensure your backend proxy URL is correct (e.g., localhost during dev, or standard /api pattern)
const TMDB_PROXY = '/api/tmdb';

export const useMovieStore = create<MovieStore>((set, get) => ({
  // --- Search ---
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  fetchSearchResults: async () => {
    const { searchQuery } = get();
    if (!searchQuery.trim()) {
        set({ searchResults: [] });
        return;
    }
    try {
      const response = await axios.get(TMDB_PROXY, {
        params: { endpoint: 'search/movie', query: searchQuery },
      });
      set({ searchResults: response.data.results || [] });
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  },

  // --- Categories ---
  topRatedMovies: [],
  upcomingMovies: [],
  popularMovies: [],
  
  topRatedPage: 1,
  upcomingPage: 1,
  popularPage: 1,

  fetchTopRatedMovies: async (page = 1) => {
    try {
      const response = await axios.get(TMDB_PROXY, {
        params: { endpoint: 'movie/top_rated', page },
      });
      set((state) => ({ 
          topRatedMovies: page === 1 ? (response.data.results || []) : [...state.topRatedMovies, ...(response.data.results || [])],
          topRatedPage: page
      }));
    } catch (err) {
      console.error("Error fetching top-rated movies:", err);
    }
  },

  fetchUpcomingMovies: async (page = 1) => {
    try {
      const response = await axios.get(TMDB_PROXY, {
        params: { endpoint: 'movie/upcoming', page },
      });
      set((state) => ({ 
          upcomingMovies: page === 1 ? (response.data.results || []) : [...state.upcomingMovies, ...(response.data.results || [])],
          upcomingPage: page
      }));
    } catch (err) {
      console.error("Error fetching upcoming movies:", err);
    }
  },

  fetchPopularMovies: async (page = 1) => {
    try {
      const response = await axios.get(TMDB_PROXY, {
        params: { endpoint: 'movie/popular', page },
      });
      set((state) => ({ 
          popularMovies: page === 1 ? (response.data.results || []) : [...state.popularMovies, ...(response.data.results || [])],
          popularPage: page
      }));
    } catch (err) {
      console.error("Error fetching popular movies:", err);
    }
  },

}));
