import { Link } from 'react-router-dom';
import type { Rating } from '../types';
import { useAuth } from '../context/AuthContext';
import ScoreBar from './ScoreBar';

interface Props {
  rating: Rating;
  onDelete?: (id: number) => void;
  onEdit?: (rating: Rating) => void;
}

export default function ReviewCard({ rating, onDelete, onEdit }: Props) {
  const { user } = useAuth();
  const canModify = user && (user.id === rating.userId || user.role === 'ADMIN');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <Link to={`/profile/${rating.userId}`} className="flex items-center gap-2 hover:opacity-80">
          {rating.userProfilePictureUrl ? (
            <img src={rating.userProfilePictureUrl} alt={rating.username}
              className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center text-white text-xs font-bold">
              {rating.username[0].toUpperCase()}
            </div>
          )}
          <span className="text-zinc-200 text-sm font-medium">{rating.username}</span>
        </Link>
        {canModify && (
          <div className="flex gap-2">
            {onEdit && user?.id === rating.userId && (
              <button onClick={() => onEdit(rating)}
                className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(rating.id)}
                className="text-red-500 hover:text-red-400 text-xs transition-colors">
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <ScoreBar label="Story" score={rating.storyScore} color="bg-blue-600" />
        <ScoreBar label="Scare" score={rating.scareScore} color="bg-purple-600" />
        <ScoreBar label="Gore" score={rating.goreScore} color="bg-red-600" />
      </div>

      {rating.reviewText && (
        <p className="text-zinc-300 text-sm leading-relaxed">{rating.reviewText}</p>
      )}
    </div>
  );
}
