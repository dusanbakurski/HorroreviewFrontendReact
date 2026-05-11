import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getUser, getUserRatings, deleteRating } from '../api';
import type { User, Rating } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewCard from '../components/ReviewCard';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const uid = Number(id);
    const cfg = { signal: ctrl.signal };
    Promise.all([
      getUser(uid, cfg).then(r => setProfile(r.data)),
      getUserRatings(uid, cfg).then(r => setRatings(r.data)),
    ])
      .catch(err => { if (!axios.isCancel(err)) showToast('Failed to load profile.', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [id, showToast]);

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
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-zinc-900 rounded-xl" />
          <div className="h-40 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-500">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 flex items-center gap-6">
        {profile.profilePictureUrl ? (
          <img src={profile.profilePictureUrl} alt={profile.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-red-800 flex items-center justify-center text-white text-2xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{profile.username}</h1>
          <p className="text-zinc-500 text-sm mt-1">{profile.email}</p>
          {profile.role === 'ADMIN' && (
            <span className="mt-2 inline-block bg-red-900/40 text-red-400 text-xs px-2 py-0.5 rounded border border-red-800">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100 mb-4">
          Reviews ({ratings.length})
        </h2>
        {ratings.length === 0 ? (
          <p className="text-zinc-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {ratings.map(rating => (
              <div key={rating.id}>
                <Link to={`/movies/${rating.movieId}`}
                  className="text-red-400 hover:text-red-300 text-sm font-medium mb-2 block transition-colors">
                  ← {rating.movieTitle}
                </Link>
                <ReviewCard
                  rating={rating}
                  onDelete={
                    currentUser && (currentUser.id === profile.id || currentUser.role === 'ADMIN')
                      ? handleDeleteRating
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
