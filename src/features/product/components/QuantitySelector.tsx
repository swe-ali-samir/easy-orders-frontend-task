import { MIN_QUANTITY, useQuantityInput } from '../hooks/use-quantity-input';

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

const stepButton =
  'flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-xl transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-40';

export function QuantitySelector({ value, max, onChange }: QuantitySelectorProps) {
  const { decrement, increment, inputProps } = useQuantityInput({ value, max, onChange });
  const unavailable = max <= 0;

  return (
    <div
      role="group"
      aria-label="Quantity"
      data-testid="quantity-selector"
      className="flex items-center gap-3"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={unavailable || value <= MIN_QUANTITY}
        onClick={decrement}
        className={stepButton}
      >
        −
      </button>
      <input
        type="number"
        aria-label="Quantity"
        data-testid="quantity-input"
        {...inputProps}
        value={unavailable ? 0 : inputProps.value}
        min={MIN_QUANTITY}
        max={max}
        disabled={unavailable}
        inputMode="numeric"
        className="h-11 w-16 rounded-lg border border-gray-300 text-center text-sm font-semibold [appearance:textfield] focus:border-gray-900 focus:outline-none disabled:bg-gray-100 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={unavailable || value >= max}
        onClick={increment}
        className={stepButton}
      >
        +
      </button>
      {unavailable && <span className="text-sm text-red-600">Out of stock</span>}
    </div>
  );
}
