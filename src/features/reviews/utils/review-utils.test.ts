import { getPageItems } from '../../../utils/pagination';
import {
  EMPTY_FILTERS,
  filterReviews,
  formatCompact,
  formatReviewDate,
  summarizeRatings,
} from './review-utils';
import { RATING_DISTRIBUTION, REVIEWS } from '../data/reviews-data';

describe('summarizeRatings', () => {
  it('matches the design summary (1.25k reviews, 4.5 average)', () => {
    expect(summarizeRatings(RATING_DISTRIBUTION)).toEqual({ total: 1250, average: 4.5 });
    expect(formatCompact(1250)).toBe('1.25k');
  });

  it('handles an empty distribution', () => {
    expect(summarizeRatings({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })).toEqual({ total: 0, average: 0 });
  });
});

describe('filterReviews', () => {
  it('filters by tab', () => {
    const media = filterReviews(REVIEWS, { ...EMPTY_FILTERS, tab: 'media' });
    const described = filterReviews(REVIEWS, { ...EMPTY_FILTERS, tab: 'description' });
    expect(media.length).toBeGreaterThan(0);
    expect(media.every((review) => review.hasMedia)).toBe(true);
    expect(described.every((review) => Boolean(review.body))).toBe(true);
  });

  it('combines rating and topic filters (topics match any)', () => {
    const result = filterReviews(REVIEWS, {
      tab: 'all',
      ratings: [4, 5],
      topics: ['Shipment', 'Seller Services'],
    });
    expect(result.map((review) => review.id).sort()).toEqual(['r10', 'r4', 'r7']);
  });
});

describe('formatReviewDate', () => {
  it('formats like the design', () => {
    expect(formatReviewDate('2020-07-02T15:29:00Z')).toBe('July 2, 2020 03:29 PM');
  });
});

describe('getPageItems', () => {
  it('lists every page when there are few', () => {
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses distant pages into ellipses', () => {
    expect(getPageItems(1, 19)).toEqual([1, 2, 'ellipsis', 19]);
    expect(getPageItems(10, 19)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 19]);
    expect(getPageItems(19, 19)).toEqual([1, 'ellipsis', 18, 19]);
  });
});
