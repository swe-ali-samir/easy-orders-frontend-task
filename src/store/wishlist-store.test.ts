import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWishlistStore } from './wishlist-store';

beforeEach(() => {
  localStorage.clear();
  act(() => useWishlistStore.setState({ ids: [] }));
});

describe('wishlist store', () => {
  it('adds and removes product ids via toggle', () => {
    const { result } = renderHook(() => useWishlistStore());

    act(() => result.current.toggle('p1'));
    expect(result.current.ids).toEqual(['p1']);

    act(() => result.current.toggle('p1'));
    expect(result.current.ids).toEqual([]);
  });

  it('validates and dedupes ids on rehydration', () => {
    localStorage.setItem(
      'easy-orders-wishlist',
      JSON.stringify({
        state: { ids: ['p1', 42, null, '', 'p1', 'p2'] },
        version: 1,
      }),
    );

    act(() => {
      useWishlistStore.persist.rehydrate();
    });

    expect(useWishlistStore.getState().ids).toEqual(['p1', 'p2']);
  });
});
