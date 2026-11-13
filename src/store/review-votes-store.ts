import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncAcrossTabs } from './sync-across-tabs';

export type Vote = 'like' | 'dislike';

interface ReviewVotesState {
  votes: Record<string, Vote>;
  /** Voting the same value again clears it; voting the other value switches. */
  vote: (reviewId: string, value: Vote) => void;
}

export const REVIEW_VOTES_STORAGE_KEY = 'easy-orders-review-votes';

function sanitizeVotes(value: unknown): Record<string, Vote> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, Vote] => entry[1] === 'like' || entry[1] === 'dislike',
    ),
  );
}

export const useReviewVotesStore = create<ReviewVotesState>()(
  persist(
    (set) => ({
      votes: {},
      vote: (reviewId, value) =>
        set((state) => {
          const votes = { ...state.votes };
          if (votes[reviewId] === value) {
            delete votes[reviewId];
          } else {
            votes[reviewId] = value;
          }
          return { votes };
        }),
    }),
    {
      name: REVIEW_VOTES_STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ votes: state.votes }),
      merge: (persisted, current) => ({
        ...current,
        votes: sanitizeVotes((persisted as { votes?: unknown } | undefined)?.votes),
      }),
    },
  ),
);

syncAcrossTabs(useReviewVotesStore, REVIEW_VOTES_STORAGE_KEY);
