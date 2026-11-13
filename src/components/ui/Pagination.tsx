import { cn } from '../../utils/cn';
import { getPageItems } from '../../utils/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  label: string;
}

const itemBase =
  'flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 text-sm font-medium transition';

export function Pagination({ page, totalPages, onChange, label }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label={label}>
      <ul className="flex items-center justify-center gap-3">
        {page > 1 && (
          <li>
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => onChange(page - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-gray-100"
            >
              <ChevronLeftIcon />
            </button>
          </li>
        )}
        {getPageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className={cn(itemBase, 'border-gray-100 text-gray-500')}
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
                className={cn(
                  itemBase,
                  item === page
                    ? 'border-gray-900 text-gray-900'
                    : 'border-gray-100 text-gray-500 hover:border-gray-300',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
        {page < totalPages && (
          <li>
            <button
              type="button"
              aria-label="Next page"
              onClick={() => onChange(page + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-gray-100"
            >
              <ChevronRightIcon />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
