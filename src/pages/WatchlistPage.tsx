import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getWatchlist, removeFromWatchlist } from '../api';
import type { Watchlist, Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';

export default function WatchlistPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const ctrl = new AbortController();
    getWatchlist({ signal: ctrl.signal })
      .then(res => { setItems(res.data); setError(null); })
      .catch(err => {
        if (axios.isCancel(err)) return;
        setError('Failed to load watchlist.');
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [user]);

  const handleRemove = async (movieId: number) => {
    try {
      await removeFromWatchlist(movieId);
      setItems(prev => prev.filter(item => item.movieId !== movieId));
    } catch {
      showToast('Failed to remove from watchlist.', 'error');
    }
  };

  const toMovie = (w: Watchlist): Movie => ({
    id: w.movieId,
    title: w.movieTitle,
    posterUrl: w.moviePosterUrl,
    releaseYear: w.releaseYear,
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400 text-lg mb-4">You need to be logged in to view your watchlist.</p>
        <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">My Watchlist</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-zinc-800" />
              <div className="p-3 h-10 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">Your watchlist is empty</p>
          <Link to="/movies" className="text-red-400 hover:text-red-300 text-sm">Browse movies →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group">
              <MovieCard movie={toMovie(item)} />
              <button
                onClick={() => handleRemove(item.movieId)}
                className="absolute top-2 right-2 bg-zinc-950/80 hover:bg-red-900/80 text-zinc-400 hover:text-red-300 rounded-full w-7 h-7 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                title="Remove from watchlist"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
