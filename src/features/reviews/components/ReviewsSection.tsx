import { useId, useState } from 'react';
import { FilterIcon } from '../../../components/ui/icons';
import { Pagination } from '../../../components/ui/Pagination';
import { cn } from '../../../utils/cn';
import { RatingSummary } from './RatingSummary';
import { ReviewFilters } from './ReviewFilters';
import { ReviewItem } from './ReviewItem';
import { RATING_SUMMARY } from '../utils/review-utils';
import type { ReviewTab } from '../types';
import { RATING_DISTRIBUTION } from '../data/reviews-data';
import { useReviewList } from '../hooks/use-review-list';

const TABS: { id: ReviewTab; label: string }[] = [
  { id: 'all', label: 'All Reviews' },
  { id: 'media', label: 'With Photo & Video' },
  { id: 'description', label: 'With Description' },
];

export function ReviewsSection() {
  const {
    filters,
    setTab,
    toggleRating,
    toggleTopic,
    page,
    totalPages,
    visible,
    goToPage,
    listHeadingRef,
  } = useReviewList();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-6 space-y-8">
      <h2 id="reviews-heading" className="text-2xl font-bold lg:text-3xl">
        Product Reviews
      </h2>

      <RatingSummary
        average={RATING_SUMMARY.average}
        total={RATING_SUMMARY.total}
        distribution={RATING_DISTRIBUTION}
      />

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
        <div id={filtersId} className={cn(filtersOpen ? 'block' : 'hidden', 'lg:block')}>
          <ReviewFilters
            ratings={filters.ratings}
            topics={filters.topics}
            onToggleRating={toggleRating}
            onToggleTopic={toggleTopic}
          />
        </div>

        <div className="lg:row-start-1 lg:col-start-2">
          <h3
            ref={listHeadingRef}
            tabIndex={-1}
            className="scroll-mt-6 text-lg font-bold focus:outline-none"
          >
            Review Lists
          </h3>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div role="group" aria-label="Review type" className="flex flex-wrap gap-2 lg:gap-3">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={filters.tab === tab.id}
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    'h-10 rounded-lg border px-3 text-sm font-medium transition lg:h-12 lg:px-5',
                    filters.tab === tab.id
                      ? 'border-gray-900 bg-gray-200'
                      : 'border-gray-200 hover:border-gray-400',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Filter reviews"
              aria-expanded={filtersOpen}
              aria-controls={filtersId}
              onClick={() => setFiltersOpen((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 lg:hidden"
            >
              <FilterIcon />
            </button>
          </div>

          {visible.length === 0 ? (
            <p data-testid="reviews-empty" className="py-10 text-center text-sm text-gray-500">
              No reviews match these filters.
            </p>
          ) : (
            <ul className="mt-2">
              {visible.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
          )}

          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={goToPage}
              label="Reviews pages"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
