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

interface MovieDetails extends Movie {
    genres: { id: number; name: string }[];
    runtime: number;
    tagline: string;
}

interface CastMember {
    id: number;
    name: string;
    profile_path: string;
    character: string;
}

interface CrewMember {
    id: number;
    name: string;
    profile_path: string;
    job: string;
}

interface Review {
    id: string;
    author: string;
    content: string;
    created_at: string;
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

  // Movie Details State
  movieDetails: MovieDetails | null;
  movieCast: CastMember[];
  movieCrew: CrewMember[];
  movieRecommendations: Movie[];
  movieReviews: Review[];
  
  fetchMovieDetails: (id: number) => Promise<void>;
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

  // --- Movie Details ---
  movieDetails: null,
  movieCast: [],
  movieCrew: [],
  movieRecommendations: [],
  movieReviews: [],

  fetchMovieDetails: async (id: number) => {
    try {
      // Fetch main details
      const detailsRes = await axios.get(TMDB_PROXY, {
          params: { endpoint: `movie/${id}` }
      });
      set({ movieDetails: detailsRes.data });

      // Fetch credits (cast/crew)
      const creditsRes = await axios.get(TMDB_PROXY, {
          params: { endpoint: `movie/${id}/credits` }
      });
      set({ 
          movieCast: creditsRes.data.cast || [],
          movieCrew: creditsRes.data.crew || []
      });

      // Fetch recommendations
      const recsRes = await axios.get(TMDB_PROXY, {
          params: { endpoint: `movie/${id}/recommendations` }
      });
      set({ movieRecommendations: recsRes.data.results || [] });

      // Fetch reviews
      const reviewsRes = await axios.get(TMDB_PROXY, {
          params: { endpoint: `movie/${id}/reviews` }
      });
      set({ movieReviews: reviewsRes.data.results || [] });

    } catch (err) {
      console.error("Error fetching movie details:", err);
    }
  }

}));
