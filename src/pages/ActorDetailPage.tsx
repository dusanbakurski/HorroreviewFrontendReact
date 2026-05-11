import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getActor, getActorMovies } from '../api';
import type { Actor, Movie } from '../types';
import MovieCard from '../components/MovieCard';

export default function ActorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const aid = Number(id);
    const cfg = { signal: ctrl.signal };
    Promise.all([
      getActor(aid, cfg).then(r => setActor(r.data)),
      getActorMovies(aid, cfg).then(r => setMovies(r.data)),
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

  if (!actor) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-500">Actor not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-6 mb-10">
        {actor.pictureUrl ? (
          <img src={actor.pictureUrl} alt={actor.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-2xl font-bold">
            {actor.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{actor.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{movies.length} film{movies.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-zinc-100 mb-4">Filmography</h2>
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
