import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb({ explode }: { explode: boolean }) {
  if (explode) {
    throw new Error('boom');
  }
  return <p>content</p>;
}

function Harness() {
  const [explode, setExplode] = useState(true);
  return (
    <ErrorBoundary
      fallback={(reset) => (
        <button
          type="button"
          onClick={() => {
            setExplode(false);
            reset();
          }}
        >
          recover
        </button>
      )}
    >
      <Bomb explode={explode} />
    </ErrorBoundary>
  );
}

describe('ErrorBoundary', () => {
  it('renders the fallback on error and the children again after reset', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'recover' }));
    expect(screen.getByText('content')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
