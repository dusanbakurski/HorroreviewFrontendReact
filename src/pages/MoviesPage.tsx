import { useEffect, useState } from 'react';
import axios from 'axios';
import { searchMovies, getDirectors, getGenres } from '../api';
import type { Movie, Director, Genre } from '../types';
import MovieCard from '../components/MovieCard';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [directorId, setDirectorId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params: { title?: string; directorId?: number; genreId?: number } = {};
      if (title) params.title = title;
      if (directorId) params.directorId = parseInt(directorId);
      if (genreId) params.genreId = parseInt(genreId);
      const res = await searchMovies(params);
      setMovies(res.data);
      setError(null);
    } catch {
      setMovies([]);
      setError('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    const cfg = { signal: ctrl.signal };
    getDirectors(undefined, cfg)
      .then(r => setDirectors(r.data))
      .catch(err => { if (!axios.isCancel(err)) setError('Failed to load filters.'); });
    getGenres(cfg)
      .then(r => setGenres(r.data))
      .catch(err => { if (!axios.isCancel(err)) setError('Failed to load filters.'); });
    fetchMovies();
    return () => ctrl.abort();
  }, []);

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleReset = () => {
    setTitle('');
    setDirectorId('');
    setGenreId('');
    setSortBy('');
    setTimeout(fetchMovies, 0);
  };

  const sortedMovies = [...movies].sort((a, b) => {
    switch (sortBy) {
      case 'title': return (a.title ?? '').localeCompare(b.title ?? '');
      case 'avg': return (b.avgScore ?? 0) - (a.avgScore ?? 0);
      case 'story': return (b.avgStory ?? 0) - (a.avgStory ?? 0);
      case 'scare': return (b.avgScare ?? 0) - (a.avgScare ?? 0);
      case 'gore': return (b.avgGore ?? 0) - (a.avgGore ?? 0);
      default: return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Browse Movies</h1>

      {/* Search / Filter */}
      <form onSubmit={handleSearch} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Search by title…"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Director</label>
            <select
              value={directorId}
              onChange={e => setDirectorId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600 transition-colors"
            >
              <option value="">All directors</option>
              {directors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Genre</label>
            <select
              value={genreId}
              onChange={e => setGenreId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600 transition-colors"
            >
              <option value="">All genres</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wide">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600 transition-colors"
            >
              <option value="title">A – Z</option>
              <option value="avg">Avg Rating</option>
              <option value="story">Story</option>
              <option value="scare">Scare</option>
              <option value="gore">Gore</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            Search
          </button>
          <button type="button" onClick={handleReset}
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm px-5 py-2 rounded-lg transition-colors">
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-2/3 bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-3/4" />
                <div className="h-2 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-1">No movies found</p>
          <p className="text-sm">Try different search terms.</p>
        </div>
      ) : (
        <>
          <p className="text-zinc-500 text-sm mb-4">{movies.length} movie{movies.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
