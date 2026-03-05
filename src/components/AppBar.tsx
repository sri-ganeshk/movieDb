import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const AppBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  const { isAuthenticated, user, logout } = useAuthStore();

  // Adjust header background opacity on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // From full opacity at top (1) to a minimum of 0.45 at scrollY>=200
      const newOpacity = Math.max(0.45, 1 - scrollY / 200);
      setBgOpacity(newOpacity);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-black relative">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 z-50 w-full p-2"
      >
        <motion.div
          initial={{ opacity: 1, scale: 1, backgroundColor: 'rgba(0,0,0,1)' }}
          animate={{ backgroundColor: `rgba(0,0,0,${bgOpacity})` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 backdrop-blur-xl rounded-2xl border border-neutral-700 shadow-lg"
        >
          <div className="flex h-16 items-center justify-between relative text-white">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="flex items-center space-x-1 transition-opacity hover:opacity-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3-3h12a3 3 0 1 0-3 3" />
                </svg>
                <span className=" font-bold font-mono text-xl sm:inline-block">
                  Film <span className="text-pink-500">Sphere</span>
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-white hover:text-gray-400 transition">
                Home
              </Link>
              <Link to="/movies/popular" className="text-white hover:text-gray-400 transition">
                Popular
              </Link>
              <Link to="/movies/top-rated" className="text-white hover:text-gray-400 transition">
                Top Rated
              </Link>
              <Link to="/movies/upcoming-movies" className="text-white hover:text-gray-400 transition">
                Upcoming
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/favorites" className="text-white hover:text-gray-400 transition">
                    Favorites
                  </Link>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-pink-500 font-semibold">{user?.name}</span>
                    <button onClick={handleLogout} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-1.5 rounded-full transition text-sm">Logout</button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 ml-4">
                  <Link to="/login" className="text-white hover:text-gray-400 transition">Login</Link>
                  <Link to="/register" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded-full transition shadow-lg shadow-pink-600/20 text-sm">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-white">
                {menuOpen ? (
                  <AiOutlineClose className="w-6 h-6" />
                ) : (
                  <AiOutlineMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <div className="md:hidden flex flex-col items-center space-y-4 py-4 text-lg border-t border-zinc-800 mt-2">
              <Link to="/" className="text-white hover:text-gray-400 transition" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/movies/popular" className="text-white hover:text-gray-400 transition" onClick={() => setMenuOpen(false)}>
                Popular
              </Link>
              <Link to="/movies/top-rated" className="text-white hover:text-gray-400 transition" onClick={() => setMenuOpen(false)}>
                Top Rated
              </Link>
              <Link to="/movies/upcoming-movies" className="text-white hover:text-gray-400 transition" onClick={() => setMenuOpen(false)}>
                Upcoming
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/favorites" className="text-white hover:text-gray-400 transition" onClick={() => setMenuOpen(false)}>
                    Favorites
                  </Link>
                  <p className="text-pink-500 font-semibold">{user?.name}</p>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-6 py-2 rounded-full transition w-full">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:text-gray-400 transition" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full transition w-full text-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.header>
    </div>
  );
};

export default AppBar;
