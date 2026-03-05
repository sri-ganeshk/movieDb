import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import AppBar from './components/AppBar';
import Home from './components/Home';
import Popular from './components/pages/PopularMovies';
import TopRatedMovies from './components/pages/TopRated';
import UpcomingMovies from './components/pages/UpcomingMovies';
import Movie from './components/Movie';
import FavoritesDropdown from './components/FavoritesDropdown';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import { useAuthStore } from './store/useAuthStore';
import { useFavoritesStore } from './store/useFavoritesStore';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  const { fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Once auth is resolved and user is logged in, pre-load their favorites
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div>
      <BrowserRouter>
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/movie/:id' element={<Movie />} />
          <Route path='/movies/popular' element={<Popular />} />
          <Route path='/movies/top-rated' element={<TopRatedMovies />} />
          <Route path='/favorites' element={
            <ProtectedRoute>
              <FavoritesDropdown />
            </ProtectedRoute>
          } />
          <Route path='/movies/upcoming-movies' element={<UpcomingMovies />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
