import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getDirector, getDirectorMovies } from '../api';
import type { Director, Movie } from '../types';
import MovieCard from '../components/MovieCard';

export default function DirectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [director, setDirector] = useState<Director | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const did = Number(id);
    const cfg = { signal: ctrl.signal };
    Promise.all([
      getDirector(did, cfg).then(r => setDirector(r.data)),
      getDirectorMovies(did, cfg).then(r => setMovies(r.data)),
    ])
      .catch(err => { if (axios.isCancel(err)) return; })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-32 bg-zinc-900 rounded-xl mb-8" />
      </div>
    );
  }

  if (!director) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-500">Director not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-6 mb-10">
        {director.pictureUrl ? (
          <img src={director.pictureUrl} alt={director.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-2xl font-bold">
            {director.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{director.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{movies.length} film{movies.length !== 1 ? 's' : ''} directed</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-zinc-100 mb-4">Directed Films</h2>
      {movies.length === 0 ? (
        <p className="text-zinc-500 text-sm">No movies listed.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
