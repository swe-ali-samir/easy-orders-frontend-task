import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EXCERPT_LENGTH, excerpt } from '../../../utils/text';
import { Description } from './Description';

const longText = Array.from({ length: 60 }, (_, index) => `word${index}`).join(' ');
const longHtml = `<p>${longText}</p>`;

describe('excerpt', () => {
  it('cuts at a word boundary and drops trailing punctuation', () => {
    expect(excerpt('alpha beta, gamma delta', 12)).toBe('alpha beta');
  });
});

describe('Description', () => {
  it('shows an excerpt with an inline See More toggle, then the full HTML', async () => {
    const user = userEvent.setup();
    render(<Description html={longHtml} text={longText} />);

    expect(screen.getByRole('heading', { name: 'Description:' })).toBeInTheDocument();
    const description = screen.getByTestId('description');
    expect(description.textContent!.length).toBeLessThan(EXCERPT_LENGTH + 20);

    await user.click(screen.getByRole('button', { name: 'See More....' }));
    expect(description).toHaveTextContent(longText);

    await user.click(screen.getByRole('button', { name: 'See Less....' }));
    expect(screen.getByRole('button', { name: 'See More....' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renders short descriptions in full without a toggle', () => {
    render(<Description html="<ul><li>Leather</li></ul>" text="Leather" />);
    expect(screen.getByRole('listitem')).toHaveTextContent('Leather');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('Description focus', () => {
  it('keeps keyboard focus on the toggle when expanding and collapsing', async () => {
    const user = userEvent.setup();
    render(<Description html={longHtml} text={longText} />);

    screen.getByRole('button', { name: 'See More....' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'See Less....' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'See More....' })).toHaveFocus();
  });
});
