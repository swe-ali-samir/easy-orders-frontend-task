import { render, screen } from '@testing-library/react';
import { RatingSummary } from './RatingSummary';

const distribution = { 5: 820, 4: 290, 3: 90, 2: 30, 1: 0 } as const;
const total = 1230;

describe('RatingSummary bars', () => {
  it('fills each bar with its share of all reviews and exposes the percentage', () => {
    render(<RatingSummary average={4.5} total={total} distribution={distribution} />);

    const bars = screen.getAllByRole('meter');
    const fills = screen.getAllByTestId('rating-bar-fill');
    expect(bars).toHaveLength(5);

    const expected = [5, 4, 3, 2, 1].map(
      (stars) => distribution[stars as 1 | 2 | 3 | 4 | 5] / total,
    );
    fills.forEach((fill, index) => {
      expect(parseFloat(fill.style.width)).toBeCloseTo(expected[index] * 100, 5);
    });
    expect(expected.reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 10);

    expect(bars[0]).toHaveAccessibleName('5-star reviews');
    expect(bars[0]).toHaveAttribute('aria-valuenow', '67');
    expect(bars[0]).toHaveAttribute('aria-valuetext', '67% (820 reviews)');
    expect(bars[0]).toHaveAttribute('title', '67% of reviews');
  });

  it('renders an empty bar for a rating with no reviews, and handles no reviews at all', () => {
    const { rerender } = render(
      <RatingSummary average={4.5} total={total} distribution={distribution} />,
    );
    expect(screen.getAllByTestId('rating-bar-fill')[4].style.width).toBe('0%');

    rerender(
      <RatingSummary average={0} total={0} distribution={{ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }} />,
    );
    for (const fill of screen.getAllByTestId('rating-bar-fill')) {
      expect(fill.style.width).toBe('0%');
    }
  });
});
