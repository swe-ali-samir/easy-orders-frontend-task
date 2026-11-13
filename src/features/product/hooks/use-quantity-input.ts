import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

export const MIN_QUANTITY = 1;

interface UseQuantityInputOptions {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

/**
 * Quantity stepper + text field. While typing, the field keeps a free-form draft (it may
 * be empty); the draft commits, clamped to [1, max], on blur or Enter. Escape or an
 * invalid draft reverts to the last valid value. Spread `inputProps` on the <input>.
 */
export function useQuantityInput({ value, max, onChange }: UseQuantityInputOptions) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (next: number) => Math.max(MIN_QUANTITY, Math.min(max, next));

  const commit = () => {
    if (draft === null) {
      return;
    }
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
    setDraft(null);
  };

  return {
    decrement: () => onChange(clamp(value - 1)),
    increment: () => onChange(clamp(value + 1)),
    inputProps: {
      value: draft ?? value,
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        setDraft(event.target.value.replace(/\D/g, '')),
      onBlur: commit,
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          commit();
        } else if (event.key === 'Escape') {
          setDraft(null);
        }
      },
    },
  };
}
