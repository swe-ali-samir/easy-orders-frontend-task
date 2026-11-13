import { fireEvent, render, screen } from '@testing-library/react';
import { ProductImage } from './ProductImage';

const SRC = 'https://cdn.example.com/shoe.webp';

describe('ProductImage', () => {
  it('retries once with a cache-busting URL, then shows a labelled fallback', () => {
    render(<ProductImage src={SRC} alt="Black sneaker" />);

    const image = screen.getByRole('img', { name: 'Black sneaker' });
    expect(image).toHaveAttribute('src', SRC);

    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Black sneaker' })).toHaveAttribute(
      'src',
      `${SRC}?retry=1`,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Black sneaker' }));
    const fallback = screen.getByTestId('image-fallback');
    expect(fallback).toHaveAttribute('role', 'img');
    expect(fallback).toHaveAccessibleName('Black sneaker');
  });

  it('hides the fallback of a decorative image from assistive tech', () => {
    render(<ProductImage src={SRC} alt="" />);
    const image = document.querySelector('img')!;
    fireEvent.error(image);
    fireEvent.error(document.querySelector('img')!);
    expect(screen.getByTestId('image-fallback')).toHaveAttribute('aria-hidden', 'true');
  });

  it('starts fresh when the source changes', () => {
    const { rerender } = render(<ProductImage src={SRC} alt="Shoe" />);
    fireEvent.error(screen.getByRole('img'));
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();

    rerender(<ProductImage src="https://cdn.example.com/other.webp" alt="Shoe" />);
    expect(screen.getByRole('img', { name: 'Shoe' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/other.webp',
    );
  });
});

describe('ProductImage retry safety', () => {
  it('retries a URL that already has a query unchanged (signed URLs stay valid)', () => {
    const signed = 'https://cdn.example.com/shoe.webp?X-Amz-Signature=abc';
    render(<ProductImage src={signed} alt="Shoe" />);
    const first = screen.getByRole('img', { name: 'Shoe' });
    fireEvent.error(first);

    const retried = screen.getByRole('img', { name: 'Shoe' });
    expect(retried).toHaveAttribute('src', signed);
    expect(retried).not.toBe(first); // remounted, so the browser re-requests it
  });

  it('does not retry inline data: images', () => {
    render(<ProductImage src="data:image/png;base64,AAAA" alt="Shoe" />);
    fireEvent.error(screen.getByRole('img', { name: 'Shoe' }));
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();
  });
});
