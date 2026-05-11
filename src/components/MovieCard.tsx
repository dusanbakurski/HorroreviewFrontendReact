import { Link } from 'react-router-dom';
import type { Movie } from '../types';

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const hasStats = movie.reviewCount !== undefined && movie.reviewCount > 0;

  return (
    <Link to={`/movies/${movie.id}`} className="group block bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-800 transition-colors">
      <div className="aspect-2/3 bg-zinc-800 overflow-hidden">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="text-zinc-100 font-medium text-sm leading-tight line-clamp-2">{movie.title}</h3>
        {movie.releaseYear && (
          <p className="text-zinc-500 text-xs">{movie.releaseYear}</p>
        )}
        {movie.director && (
          <p className="text-zinc-500 text-xs truncate">{movie.director.name}</p>
        )}
        {hasStats && (
          <div className="pt-1 border-t border-zinc-800 grid grid-cols-4 gap-1">
            {[
              { label: 'Avg', value: movie.avgScore!, color: 'text-yellow-400' },
              { label: 'Story', value: movie.avgStory!, color: 'text-blue-400' },
              { label: 'Scare', value: movie.avgScare!, color: 'text-purple-400' },
              { label: 'Gore', value: movie.avgGore!, color: 'text-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`${color} text-xs font-semibold leading-none`}>{value.toFixed(1)}</div>
                <div className="text-zinc-600" style={{ fontSize: '9px' }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
