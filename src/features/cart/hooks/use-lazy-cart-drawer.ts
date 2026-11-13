import { lazy, useEffect, useState } from 'react';
import { selectCartIsOpen, useCartStore } from '../../../store/cart-store';

const loadCartDrawer = () => import('../components/CartDrawer');
const createLazyDrawer = () =>
  lazy(() => loadCartDrawer().then((module) => ({ default: module.CartDrawer })));

/**
 * Loading strategy for the code-split cart drawer:
 * - prefetch the chunk when the browser is idle after first paint (first open feels instant);
 * - mount on first open, then stay mounted so the close transition can play;
 * - `retry` after a failed load. React.lazy caches a rejected import forever, so each retry
 *   needs a fresh lazy component; `attempt` changes too, to key (reset) an error boundary.
 */
export function useLazyCartDrawer() {
  const isOpen = useCartStore(selectCartIsOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const [hasOpened, setHasOpened] = useState(isOpen);
  const [loader, setLoader] = useState(() => ({ CartDrawer: createLazyDrawer(), attempt: 0 }));

  if (isOpen && !hasOpened) {
    setHasOpened(true);
  }

  useEffect(() => {
    // Prefetch only; a failure here is handled when the drawer actually loads.
    const prefetch = () => void loadCartDrawer().catch(() => undefined);
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(prefetch, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const retry = () =>
    setLoader((current) => ({ CartDrawer: createLazyDrawer(), attempt: current.attempt + 1 }));

  return {
    CartDrawer: loader.CartDrawer,
    attempt: loader.attempt,
    shouldRender: hasOpened,
    isOpen,
    retry,
    dismiss: closeCart,
  };
}
