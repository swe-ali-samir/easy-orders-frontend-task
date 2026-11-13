import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useReviewVotesStore } from '../../../store/review-votes-store';
import { ReviewsSection } from './ReviewsSection';
import { REVIEWS_PAGE_SIZE } from '../hooks/use-review-list';
import { REVIEWS } from '../data/reviews-data';

beforeEach(() => {
  localStorage.clear();
  act(() => useReviewVotesStore.setState({ votes: {} }));
});

describe('ReviewsSection', () => {
  it('paginates', async () => {
    const user = userEvent.setup();
    render(<ReviewsSection />);

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByTestId('review-item')).toHaveLength(
      REVIEWS.length - 2 * REVIEWS_PAGE_SIZE,
    );
  });

  it('filters by rating and resets to the first page', async () => {
    const user = userEvent.setup();
    render(<ReviewsSection />);

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    await user.click(screen.getByRole('button', { name: 'Filter reviews' }));
    await user.click(screen.getByRole('checkbox', { name: '1 stars' }));

    const items = screen.getAllByTestId('review-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Savannah Nguyen');
    expect(screen.queryByRole('navigation', { name: 'Reviews pages' })).not.toBeInTheDocument();
  });

  it('filters by tab and shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    render(<ReviewsSection />);

    await user.click(screen.getByRole('button', { name: 'With Photo & Video' }));
    expect(screen.getByRole('button', { name: 'With Photo & Video' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Filter reviews' }));
    await user.click(screen.getByRole('checkbox', { name: '2 stars' }));
    expect(screen.getByTestId('reviews-empty')).toBeInTheDocument();
  });

  it('likes a review, updates the count and persists the vote', async () => {
    const user = userEvent.setup();
    render(<ReviewsSection />);

    const first = screen.getAllByTestId('review-item')[0];
    const like = within(first).getByRole('button', { name: /^Like review by Darrell Steward/ });
    expect(within(first).getByTestId('like-count')).toHaveTextContent('128');

    await user.click(like);
    expect(like).toHaveAttribute('aria-pressed', 'true');
    expect(within(first).getByTestId('like-count')).toHaveTextContent('129');

    await user.click(within(first).getByRole('button', { name: /^Dislike review by/ }));
    expect(within(first).getByTestId('like-count')).toHaveTextContent('128');
    expect(JSON.parse(localStorage.getItem('easy-orders-review-votes')!).state.votes).toEqual({
      r1: 'dislike',
    });
  });
});

describe('ReviewsSection focus management', () => {
  it('moves focus to the review list after paging, even when the clicked arrow unmounts', async () => {
    const user = userEvent.setup();
    render(<ReviewsSection />);
    const heading = screen.getByRole('heading', { name: 'Review Lists' });

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(heading).toHaveFocus();

    // "Previous page" disappears on page 1; focus must not fall back to <body>.
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.queryByRole('button', { name: 'Previous page' })).not.toBeInTheDocument();
    expect(heading).toHaveFocus();
  });
});
