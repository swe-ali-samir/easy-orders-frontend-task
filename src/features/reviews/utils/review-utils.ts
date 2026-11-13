import { RATING_DISTRIBUTION } from '../data/reviews-data';
import type { Review, ReviewFilterState } from '../types';

export const EMPTY_FILTERS: ReviewFilterState = { tab: 'all', ratings: [], topics: [] };

export function filterReviews(reviews: Review[], filters: ReviewFilterState): Review[] {
  return reviews.filter((review) => {
    if (filters.tab === 'media' && !review.hasMedia) return false;
    if (filters.tab === 'description' && !review.body) return false;
    if (filters.ratings.length > 0 && !filters.ratings.includes(review.rating)) return false;
    if (
      filters.topics.length > 0 &&
      !review.topics.some((topic) => filters.topics.includes(topic))
    ) {
      return false;
    }
    return true;
  });
}

export function summarizeRatings(distribution: Record<number, number>): {
  total: number;
  average: number;
} {
  let total = 0;
  let weighted = 0;
  for (const [stars, count] of Object.entries(distribution)) {
    total += count;
    weighted += Number(stars) * count;
  }
  return { total, average: total === 0 ? 0 : Math.round((weighted / total) * 10) / 10 };
}

/** The product's (static) rating, shown in the price row, the rails and the reviews section. */
export const RATING_SUMMARY = summarizeRatings(RATING_DISTRIBUTION);

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export function formatCompact(value: number): string {
  return compactFormatter.format(value).toLowerCase();
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: 'UTC',
});

/** "July 2, 2020 03:29 PM" — matches the design's format. */
export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
}
