import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuantitySelector } from './QuantitySelector';

describe('QuantitySelector', () => {
  it('increments and decrements within bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={3} max={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onChange).toHaveBeenCalledWith(4);

    await user.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables the stepper at the bounds', () => {
    const { rerender } = render(<QuantitySelector value={1} max={5} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();

    rerender(<QuantitySelector value={5} max={5} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled();
  });

  it('clamps a typed value above the maximum when committed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={2} max={5} onChange={onChange} />);

    await user.type(screen.getByTestId('quantity-input'), '9');
    expect(onChange).not.toHaveBeenCalled(); // still editing
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('can be cleared and retyped, committing on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={1} max={10} onChange={onChange} />);
    const input = screen.getByTestId('quantity-input');

    await user.clear(input);
    expect(input).toHaveValue(null); // empty while editing, no snap-back
    await user.type(input, '5{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('reverts an empty draft to the last valid value on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantitySelector value={3} max={10} onChange={onChange} />);
    const input = screen.getByTestId('quantity-input');

    await user.clear(input);
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue(3);
  });
});
