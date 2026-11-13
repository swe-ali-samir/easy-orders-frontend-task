import { ThumbDownIcon, ThumbUpIcon } from '../../../components/ui/icons';
import { StarRating } from '../../../components/ui/StarRating';
import { useReviewVotesStore } from '../../../store/review-votes-store';
import { cn } from '../../../utils/cn';
import { formatReviewDate } from '../utils/review-utils';
import type { Review } from '../types';

const AVATAR_COLORS = [
  'bg-indigo-100',
  'bg-rose-100',
  'bg-sky-100',
  'bg-amber-100',
  'bg-emerald-100',
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-gray-800 lg:h-9 lg:w-9',
        color,
      )}
    >
      {initials(name)}
    </span>
  );
}

const voteButton =
  'flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 transition hover:border-gray-400 lg:h-14 lg:min-w-14 lg:px-4';

export function ReviewItem({ review }: { review: Review }) {
  const vote = useReviewVotesStore((state) => state.votes[review.id]);
  const castVote = useReviewVotesStore((state) => state.vote);
  const likes = review.likes + (vote === 'like' ? 1 : 0);

  return (
    <li data-testid="review-item" className="border-b border-dashed border-gray-300 py-6 lg:py-7">
      <StarRating rating={review.rating} starClassName="h-5 w-5 lg:h-6 lg:w-6" />
      <h4 className="mt-3 text-sm font-bold lg:mt-4 lg:text-lg">{review.title}</h4>
      <p className="mt-1 text-xs text-gray-500 lg:text-sm">
        <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
      </p>
      {review.body && <p className="mt-3 text-sm text-gray-600">{review.body}</p>}

      <div className="mt-3 flex items-center justify-between gap-4 lg:mt-1">
        <div className="flex items-center gap-3">
          <Avatar name={review.author} />
          <span className="text-sm font-medium lg:text-base">{review.author}</span>
        </div>
        <div className="flex gap-2 lg:gap-4">
          <button
            type="button"
            aria-pressed={vote === 'like'}
            aria-label={`Like review by ${review.author}, ${likes} likes`}
            onClick={() => castVote(review.id, 'like')}
            className={voteButton}
          >
            <ThumbUpIcon
              filled={vote === 'like'}
              className={cn('h-5 w-5 lg:h-6 lg:w-6', vote === 'like' && 'text-gray-900')}
            />
            <span data-testid="like-count">{likes}</span>
          </button>
          <button
            type="button"
            aria-pressed={vote === 'dislike'}
            aria-label={`Dislike review by ${review.author}`}
            onClick={() => castVote(review.id, 'dislike')}
            className={voteButton}
          >
            <ThumbDownIcon
              filled={vote === 'dislike'}
              className={cn('h-5 w-5 lg:h-6 lg:w-6', vote === 'dislike' && 'text-gray-900')}
            />
          </button>
        </div>
      </div>
    </li>
  );
}
