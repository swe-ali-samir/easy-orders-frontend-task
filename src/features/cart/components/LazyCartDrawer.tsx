import { Suspense } from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useLazyCartDrawer } from '../hooks/use-lazy-cart-drawer';

export function LazyCartDrawer() {
  const { CartDrawer, attempt, shouldRender, isOpen, retry, dismiss } = useLazyCartDrawer();

  if (!shouldRender) {
    return null;
  }
  return (
    <ErrorBoundary
      key={attempt}
      fallback={() =>
        isOpen ? (
          <div
            role="alert"
            className="fixed inset-x-4 bottom-4 z-50 flex flex-wrap items-center gap-3 rounded-lg bg-gray-950 px-4 py-3 text-sm text-white shadow-lg sm:inset-x-auto sm:right-6"
          >
            <span>We couldn&apos;t open your cart. Check your connection.</span>
            <button
              type="button"
              onClick={retry}
              className="rounded-md bg-white px-3 py-1.5 font-semibold text-gray-900"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md px-3 py-1.5 font-semibold text-white underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        ) : null
      }
    >
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
    </ErrorBoundary>
  );
}
