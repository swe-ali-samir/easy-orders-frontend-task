import { StarIcon } from '../../../components/ui/icons';
import { StarRating } from '../../../components/ui/StarRating';
import { formatCompact } from '../utils/review-utils';

interface RatingSummaryProps {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function RatingRing({ average }: { average: number }) {
  const progress = Math.min(1, Math.max(0, average / 5));
  return (
    <div className="relative h-16 w-16 shrink-0 lg:h-[88px] lg:w-[88px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="6"
          className="stroke-gray-100"
        />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          className="stroke-star"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold lg:text-xl">
        {average.toFixed(1)}
      </span>
    </div>
  );
}

export function RatingSummary({ average, total, distribution }: RatingSummaryProps) {
  const rows = ([5, 4, 3, 2, 1] as const).map((stars) => {
    const share = total === 0 ? 0 : distribution[stars] / total;
    return { stars, count: distribution[stars], share, percent: Math.round(share * 100) };
  });

  return (
    <div
      data-testid="rating-summary"
      className="flex flex-col gap-6 rounded-xl border border-dashed border-gray-300 p-4 lg:flex-row lg:items-start lg:gap-16 lg:p-6"
    >
      <div className="flex items-center gap-4 lg:w-72">
        <RatingRing average={average} />
        <div className="space-y-1.5">
          <StarRating rating={average} starClassName="h-5 w-5 lg:h-6 lg:w-6" />
          <p className="text-sm text-gray-500">from {formatCompact(total)} reviews</p>
        </div>
      </div>

      <dl className="flex-1 space-y-3 lg:space-y-4">
        {rows.map((row) => (
          <div key={row.stars} className="flex items-center gap-4 lg:gap-8">
            <dt className="flex w-12 shrink-0 items-center gap-1.5 text-sm font-medium">
              {row.stars.toFixed(1)}
              <StarIcon className="h-4 w-4 text-star" />
              <span className="sr-only">stars</span>
            </dt>
            <dd className="flex flex-1 items-center gap-4 lg:gap-8">
              <span
                role="meter"
                aria-label={`${row.stars}-star reviews`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={row.percent}
                aria-valuetext={`${row.percent}% (${row.count} reviews)`}
                title={`${row.percent}% of reviews`}
                data-testid="rating-bar"
                className="h-2 flex-1 overflow-hidden rounded-full bg-rating-track"
              >
                <span
                  data-testid="rating-bar-fill"
                  className="block h-full rounded-full bg-gray-900"
                  style={{ width: `${row.share * 100}%` }}
                />
              </span>
              <span className="w-10 text-right text-sm font-medium">{row.count}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
