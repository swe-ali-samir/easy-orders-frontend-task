import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariationSelector } from './VariationSelector';
import { productFixture } from '../../../test/fixtures';

const allAvailable = () => true;

type Predicate = (group: string, option: string) => boolean;

function setup(
  onSelect = vi.fn(),
  isAvailable: Predicate = allAvailable,
  isSelectable: Predicate = allAvailable,
) {
  render(
    <VariationSelector
      groups={productFixture.variations}
      selection={{}}
      isAvailable={isAvailable}
      isSelectable={isSelectable}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
}

describe('VariationSelector', () => {
  it('disables options with no purchasable combination', async () => {
    const user = userEvent.setup();
    const notBrown: Predicate = (_group, option) => option !== 'brown';
    const { onSelect } = setup(vi.fn(), notBrown, notBrown);

    const brown = screen.getByRole('button', { name: 'color: brown' });
    expect(brown).toBeDisabled();
    await user.click(brown);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('keeps options that conflict with the current selection clickable and labelled', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup(vi.fn(), (_group, option) => option !== '38');

    const size38 = screen.getByRole('button', {
      name: '38, not available with current selection',
    });
    expect(size38).toBeEnabled();
    expect(size38).toHaveClass('line-through', 'border-dashed', 'text-gray-500');
    expect(size38).not.toHaveClass('opacity-40');
    expect(size38).not.toHaveClass('text-gray-900');
    await user.click(size38);
    expect(onSelect).toHaveBeenCalledWith('size', '38');
  });
});
