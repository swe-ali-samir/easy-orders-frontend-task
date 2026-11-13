import { useEffect, useRef, useState } from 'react';
import { EMPTY_FILTERS, filterReviews } from '../utils/review-utils';
import { REVIEWS } from '../data/reviews-data';
import type { ReviewFilterState, ReviewTab, ReviewTopic } from '../types';

export const REVIEWS_PAGE_SIZE = 4;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * Filtering (tab, ratings, topics) and pagination over the static reviews. Any filter
 * change returns to page 1. After paging, focus moves to the element given
 * `listHeadingRef` (WAI guidance), which also covers Previous/Next unmounting at the
 * first/last page.
 */
export function useReviewList() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusListAfterPaging = useRef(false);

  useEffect(() => {
    if (focusListAfterPaging.current) {
      focusListAfterPaging.current = false;
      listHeadingRef.current?.focus();
    }
  }, [page]);

  const filtered = filterReviews(REVIEWS, filters);
  const totalPages = Math.max(1, Math.ceil(filtered.length / REVIEWS_PAGE_SIZE));
  const visible = filtered.slice((page - 1) * REVIEWS_PAGE_SIZE, page * REVIEWS_PAGE_SIZE);

  // Updates derive from the current state, so rapid successive toggles never lose one.
  const updateFilters = (update: (current: ReviewFilterState) => Partial<ReviewFilterState>) => {
    setFilters((current) => ({ ...current, ...update(current) }));
    setPage(1);
  };

  return {
    filters,
    setTab: (tab: ReviewTab) => updateFilters(() => ({ tab })),
    toggleRating: (rating: number) =>
      updateFilters((current) => ({ ratings: toggle(current.ratings, rating) })),
    toggleTopic: (topic: ReviewTopic) =>
      updateFilters((current) => ({ topics: toggle(current.topics, topic) })),
    page,
    totalPages,
    visible,
    goToPage: (next: number) => {
      focusListAfterPaging.current = true;
      setPage(next);
    },
    listHeadingRef,
  };
}
