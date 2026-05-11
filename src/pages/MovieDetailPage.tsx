import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  getMovie, getMovieActors, getMovieGenres, getMovieRatings,
  addToWatchlist, removeFromWatchlist, getWatchlist,
  createRating, updateRating, deleteRating,
} from '../api';
import type { Movie, MovieActor, MovieGenre, Rating, RatingDTO, Watchlist } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewCard from '../components/ReviewCard';
import ScoreBar from '../components/ScoreBar';

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span><span className="font-bold text-zinc-200">{value}</span>
      </div>
      <input
        type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-red-600"
      />
    </div>
  );
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const movieId = Number(id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [actors, setActors] = useState<MovieActor[]>([]);
  const [movieGenres, setMovieGenres] = useState<MovieGenre[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  const [form, setForm] = useState<RatingDTO>({ storyScore: 5, scareScore: 5, goreScore: 5, reviewText: '' });
  const [submitting, setSubmitting] = useState(false);

  const myRating = user ? ratings.find(r => r.userId === user.id) : undefined;

  useEffect(() => {
    const ctrl = new AbortController();
    const cfg = { signal: ctrl.signal };
    const fetches: Promise<unknown>[] = [
      getMovie(movieId, cfg).then(r => setMovie(r.data)),
      getMovieActors(movieId, cfg).then(r => setActors(r.data)),
      getMovieGenres(movieId, cfg).then(r => setMovieGenres(r.data)),
      getMovieRatings(movieId, cfg).then(r => setRatings(r.data)),
    ];
    if (user) {
      fetches.push(
        getWatchlist(cfg).then(r => {
          const wl = r.data as Watchlist[];
          setInWatchlist(wl.some(w => w.movieId === movieId));
        })
      );
    }
    Promise.all(fetches)
      .catch(err => { if (!axios.isCancel(err)) showToast('Failed to load movie.', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [movieId, user, showToast]);

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await removeFromWatchlist(movieId);
        setInWatchlist(false);
      } else {
        await addToWatchlist(movieId);
        setInWatchlist(true);
      }
    } catch {
      showToast('Failed to update watchlist.', 'error');
    }
  };

  const openReviewForm = (rating?: Rating) => {
    if (rating) {
      setEditingRating(rating);
      setForm({ storyScore: rating.storyScore, scareScore: rating.scareScore, goreScore: rating.goreScore, reviewText: rating.reviewText || '' });
    } else {
      setEditingRating(null);
      setForm({ storyScore: 5, scareScore: 5, goreScore: 5, reviewText: '' });
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRating) {
        const res = await updateRating(editingRating.id, form);
        setRatings(prev => prev.map(r => r.id === editingRating.id ? res.data : r));
      } else {
        const res = await createRating(movieId, form);
        setRatings(prev => [...prev, res.data]);
      }
      setShowReviewForm(false);
    } catch {
      showToast('Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async (ratingId: number) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteRating(ratingId);
      setRatings(prev => prev.filter(r => r.id !== ratingId));
    } catch {
      showToast('Failed to delete review.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[2/3] bg-zinc-900 rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-zinc-900 rounded w-3/4" />
            <div className="h-4 bg-zinc-900 rounded w-1/2" />
            <div className="h-20 bg-zinc-900 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-500">Movie not found.</div>;
  }

  const avgStory = avg(ratings.map(r => r.storyScore));
  const avgScare = avg(ratings.map(r => r.scareScore));
  const avgGore = avg(ratings.map(r => r.goreScore));
  const overallAvg = ratings.length ? avg([avgStory, avgScare, avgGore]) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link to="/movies" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6 inline-block">
        ← Back to movies
      </Link>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="md:col-span-1">
          <div className="aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            {movie.posterUrl
              ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
            }
          </div>
        </div>

        <div className="md:col-span-2 space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-1">{movie.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-500 text-sm">
              {movie.releaseYear && <span>{movie.releaseYear}</span>}
              {movie.durationMinutes && <span>{movie.durationMinutes} min</span>}
              {movie.language && <span>{movie.language}</span>}
            </div>
          </div>

          {movie.director && (
            <p className="text-zinc-400 text-sm">
              Directed by{' '}
              <Link to={`/directors/${movie.director.id}`}
                className="text-zinc-200 hover:text-red-400 transition-colors">
                {movie.director.name}
              </Link>
            </p>
          )}

          {movieGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movieGenres.map(mg => (
                <span key={mg.id.genreId}
                  className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full border border-zinc-700">
                  {mg.genre.name}
                </span>
              ))}
            </div>
          )}

          {movie.description && (
            <p className="text-zinc-400 text-sm leading-relaxed">{movie.description}</p>
          )}

          {/* Avg Scores */}
          {ratings.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-300 text-sm font-medium">Community Scores</span>
                <span className="text-zinc-400 text-xs">{ratings.length} review{ratings.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-red-500">{overallAvg.toFixed(1)}</span>
                <span className="text-zinc-500 text-sm">/ 10</span>
              </div>
              <ScoreBar label="Story" score={avgStory} color="bg-blue-600" />
              <ScoreBar label="Scare" score={avgScare} color="bg-purple-600" />
              <ScoreBar label="Gore" score={avgGore} color="bg-red-600" />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {user ? (
              <>
                <button onClick={toggleWatchlist}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    inWatchlist
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                  }`}>
                  {inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                </button>
                {!myRating ? (
                  <button onClick={() => openReviewForm()}
                    className="px-5 py-2 rounded-lg text-sm font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
                    Write Review
                  </button>
                ) : (
                  <button onClick={() => openReviewForm(myRating)}
                    className="px-5 py-2 rounded-lg text-sm font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
                    Edit My Review
                  </button>
                )}
              </>
            ) : (
              <Link to="/login"
                className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                Sign in to Review
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-zinc-100 mb-5">
              {editingRating ? 'Edit Review' : 'Write a Review'}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <ScoreInput label="Story Score" value={form.storyScore}
                onChange={v => setForm(f => ({ ...f, storyScore: v }))} />
              <ScoreInput label="Scare Score" value={form.scareScore}
                onChange={v => setForm(f => ({ ...f, scareScore: v }))} />
              <ScoreInput label="Gore Score" value={form.goreScore}
                onChange={v => setForm(f => ({ ...f, goreScore: v }))} />
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Review (optional)</label>
                <textarea
                  value={form.reviewText}
                  onChange={e => setForm(f => ({ ...f, reviewText: e.target.value }))}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-red-600 resize-none transition-colors"
                  placeholder="Share your thoughts…"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors">
                  {submitting ? 'Submitting…' : editingRating ? 'Update' : 'Submit'}
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)}
                  className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 py-2 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cast */}
      {actors.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-zinc-100 mb-4">Cast</h2>
          <div className="flex flex-wrap gap-3">
            {actors.map(ma => (
              <Link key={ma.id.actorId} to={`/actors/${ma.id.actorId}`}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-4 py-2.5 transition-colors">
                {ma.actor.pictureUrl ? (
                  <img src={ma.actor.pictureUrl} alt={ma.actor.name}
                    className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold">
                    {ma.actor.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-zinc-200 text-sm font-medium">{ma.actor.name}</p>
                  {ma.characterName && <p className="text-zinc-500 text-xs">{ma.characterName}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-lg font-bold text-zinc-100 mb-4">
          Reviews ({ratings.length})
        </h2>
        {ratings.length === 0 ? (
          <p className="text-zinc-500 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {ratings.map(rating => (
              <ReviewCard
                key={rating.id}
                rating={rating}
                onDelete={user && (user.id === rating.userId || user.role === 'ADMIN') ? handleDeleteRating : undefined}
                onEdit={user && user.id === rating.userId ? openReviewForm : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
