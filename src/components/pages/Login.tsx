import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 pt-20">
      <div className="bg-zinc-800 p-8 rounded-xl shadow-xl max-w-md w-full border border-zinc-700">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-zinc-400 text-center mt-4">
          Don't have an account? <Link to="/register" className="text-pink-500 hover:text-pink-400">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
