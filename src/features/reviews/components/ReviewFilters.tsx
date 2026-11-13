import { useId, useState, type ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from '../../../components/ui/icons';
import { REVIEW_TOPICS } from '../data/reviews-data';
import type { ReviewTopic } from '../types';

interface ReviewFiltersProps {
  ratings: number[];
  topics: ReviewTopic[];
  onToggleRating: (rating: number) => void;
  onToggleTopic: (topic: ReviewTopic) => void;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <fieldset className="border-b border-dashed border-gray-300 py-5 last:border-b-0">
      <legend className="sr-only">{title}</legend>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between text-sm font-semibold"
      >
        {title}
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      <div id={contentId} hidden={!open} className="mt-4 space-y-3">
        {children}
      </div>
    </fieldset>
  );
}

const checkboxClass = 'h-5 w-5 shrink-0 rounded border-gray-300 accent-gray-900';

export function ReviewFilters({
  ratings,
  topics,
  onToggleRating,
  onToggleTopic,
}: ReviewFiltersProps) {
  return (
    <div
      data-testid="review-filters"
      className="rounded-xl border border-dashed border-gray-300 px-6 pt-5"
    >
      <h3 className="border-b border-dashed border-gray-300 pb-5 text-lg font-bold">
        Reviews Filter
      </h3>

      <FilterGroup title="Rating">
        {[5, 4, 3, 2, 1].map((rating) => (
          <label
            key={rating}
            className="flex cursor-pointer items-center gap-3 text-sm font-medium"
          >
            <input
              type="checkbox"
              checked={ratings.includes(rating)}
              onChange={() => onToggleRating(rating)}
              aria-label={`${rating} stars`}
              className={checkboxClass}
            />
            <StarIcon className="h-4 w-4 text-star" />
            <span aria-hidden="true">{rating}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Review Topics">
        {REVIEW_TOPICS.map((topic) => (
          <label
            key={topic}
            className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-600"
          >
            <input
              type="checkbox"
              checked={topics.includes(topic)}
              onChange={() => onToggleTopic(topic)}
              className={checkboxClass}
            />
            {topic}
          </label>
        ))}
      </FilterGroup>
    </div>
  );
}
