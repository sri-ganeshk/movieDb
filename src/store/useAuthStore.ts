import { create } from 'zustand';
import axios from 'axios';
import { useFavoritesStore } from './useFavoritesStore';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (userData: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.get('/api/auth/user');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (userData) => {
    try {
      const res = await axios.post('/api/auth/login', userData);
      set({ user: res.data.user, isAuthenticated: true });
    } catch (error: any) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  register: async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      set({ user: res.data.user, isAuthenticated: true });
    } catch (error: any) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  logout: async () => {
    try {
      await axios.post('/api/auth/logout');
      set({ user: null, isAuthenticated: false });
      // Clear favorites so the next user doesn't see stale data
      useFavoritesStore.setState({ favorites: [], favoriteIds: [] });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },
}));

