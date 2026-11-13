import { act } from '@testing-library/react';
import { REVIEW_VOTES_STORAGE_KEY, useReviewVotesStore } from './review-votes-store';

const store = () => useReviewVotesStore.getState();

beforeEach(() => {
  localStorage.clear();
  act(() => useReviewVotesStore.setState({ votes: {} }));
});

describe('review votes store', () => {
  it('toggles a like on and off', () => {
    act(() => store().vote('r1', 'like'));
    expect(store().votes).toEqual({ r1: 'like' });
    act(() => store().vote('r1', 'like'));
    expect(store().votes).toEqual({});
  });

  it('drops invalid entries on rehydration', () => {
    localStorage.setItem(
      REVIEW_VOTES_STORAGE_KEY,
      JSON.stringify({ state: { votes: { r1: 'like', r2: 'meh', r3: 5 } }, version: 1 }),
    );
    act(() => {
      useReviewVotesStore.persist.rehydrate();
    });
    expect(store().votes).toEqual({ r1: 'like' });
  });
});
