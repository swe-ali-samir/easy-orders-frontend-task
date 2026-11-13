import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCartStore } from '../../../store/cart-store';
import { LazyCartDrawer } from './LazyCartDrawer';

// Simulates the real failure: the drawer chunk's dynamic import() *rejects* until the
// connection is "restored". React.lazy caches a rejected import, so recovery only works if
// the retry creates a fresh lazy component.
const network = vi.hoisted(() => ({ online: false }));
vi.mock('./CartDrawer', async () => {
  if (!network.online) {
    throw new Error('Failed to fetch dynamically imported module');
  }
  return { CartDrawer: () => <div role="dialog" aria-label="Your Cart" /> };
});

beforeEach(() => {
  network.online = false;
  vi.spyOn(console, 'error').mockImplementation(() => undefined); // React logs caught errors
  act(() => useCartStore.setState({ items: [], isOpen: false, lastAdd: null }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

// One journey on purpose: a successful import is cached for the rest of the file, so the
// failing states must all be exercised before the connection comes back.
describe('LazyCartDrawer failure handling', () => {
  it('fails gracefully, can be dismissed, and recovers on retry once the chunk loads', async () => {
    const user = userEvent.setup();
    render(
      <>
        <p>product page</p>
        <LazyCartDrawer />
      </>,
    );

    // The chunk fails: an alert instead of a crashed page.
    act(() => useCartStore.getState().openCart());
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't open your cart");
    expect(screen.getByText('product page')).toBeInTheDocument();

    // Dismiss closes the cart.
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(useCartStore.getState().isOpen).toBe(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Still offline: retrying fails again, still gracefully.
    act(() => useCartStore.getState().openCart());
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    // Connection restored: retry must use a fresh loader (React.lazy caches the rejection).
    network.online = true;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('dialog', { name: 'Your Cart' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
