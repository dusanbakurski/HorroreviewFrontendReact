import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { searchMovies } from '../api';
import type { Movie } from '../types';
import MovieCard from '../components/MovieCard';

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    searchMovies({}, { signal: ctrl.signal })
      .then(res => { setMovies(res.data); setError(null); })
      .catch(err => {
        if (axios.isCancel(err)) return;
        setError('Failed to load movies.');
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const featured = movies.slice(0, 4);
  const recent = movies.slice(0, 12);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent z-10" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #dc2626 0%, transparent 60%)' }} />

        <div className="relative z-20 max-w-7xl mx-auto px-4 py-24">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              The Home for <span className="text-red-500">Horror</span> Movie Reviews
            </h1>
            <p className="text-zinc-400 text-lg mb-8">
              Rate movies on story, scare factor, and gore. Discover what truly terrifies.
            </p>
            <div className="flex gap-4">
              <Link to="/movies"
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Browse Movies
              </Link>
              <Link to="/register"
                className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Join Now
              </Link>
            </div>
          </div>
        </div>

        {/* Featured posters strip */}
        {featured.length > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-96 z-10 hidden lg:flex items-center gap-3 pr-4 overflow-hidden opacity-40">
            {featured.map(m => (
              <div key={m.id} className="flex-shrink-0 w-32 rounded-lg overflow-hidden">
                {m.posterUrl
                  ? <img src={m.posterUrl} alt={m.title} className="w-full h-48 object-cover" />
                  : <div className="w-full h-48 bg-zinc-800" />
                }
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Score Legend */}
      <section className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-10 h-1.5 bg-blue-600 rounded mx-auto mb-2" />
              <p className="text-zinc-200 font-medium text-sm">Story</p>
              <p className="text-zinc-500 text-xs mt-1">Plot, writing & atmosphere</p>
            </div>
            <div>
              <div className="w-10 h-1.5 bg-purple-600 rounded mx-auto mb-2" />
              <p className="text-zinc-200 font-medium text-sm">Scare</p>
              <p className="text-zinc-500 text-xs mt-1">Fear factor & tension</p>
            </div>
            <div>
              <div className="w-10 h-1.5 bg-red-600 rounded mx-auto mb-2" />
              <p className="text-zinc-200 font-medium text-sm">Gore</p>
              <p className="text-zinc-500 text-xs mt-1">Violence & practical effects</p>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-100">All Movies</h2>
          <Link to="/movies" className="text-red-400 hover:text-red-300 text-sm transition-colors">
            View all →
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-zinc-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                  <div className="h-2 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-2">No movies yet</p>
            <p className="text-sm">Check back soon or add some as an admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recent.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
