import { cn } from '../../utils/cn';
import { StarIcon } from './icons';

interface StarRatingProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({ rating, className, starClassName = 'h-5 w-5' }: StarRatingProps) {
  const filled = Math.round(rating);
  return (
    <div role="img" aria-label={`Rated ${rating} out of 5`} className={cn('flex gap-1', className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          className={cn(starClassName, index < filled ? 'text-star' : 'text-gray-200')}
        />
      ))}
    </div>
  );
}
