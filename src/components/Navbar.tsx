import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-red-500 font-bold text-xl tracking-wider uppercase">
          Horroreview
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/movies" className="text-zinc-300 hover:text-white text-sm transition-colors">
            Movies
          </Link>

          {user ? (
            <>
              <Link to="/watchlist" className="text-zinc-300 hover:text-white text-sm transition-colors">
                Watchlist
              </Link>
              <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-zinc-300 hover:text-white text-sm transition-colors">
                  {user.username}
                </span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 text-sm transition-colors">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-300 hover:text-white text-sm transition-colors">
                Login
              </Link>
              <Link to="/register"
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
