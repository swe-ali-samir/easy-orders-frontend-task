import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Gallery } from './Gallery';

const images = ['https://example.com/a.webp', 'https://example.com/b.webp'];

function renderGallery(props: Partial<Parameters<typeof Gallery>[0]> = {}) {
  return render(<Gallery productId="p1" images={images} alt="Sneaker" {...props} />);
}

describe('Gallery', () => {
  it('navigates with the previous and next rail buttons, wrapping around', async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(screen.getByRole('button', { name: /previous image/i }));
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', images[1]);

    await user.click(screen.getByRole('button', { name: /next image/i }));
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', images[0]);
  });

  it('jumps to the highlighted image when the selection changes', () => {
    const { rerender } = renderGallery();

    rerender(<Gallery productId="p1" images={images} alt="Sneaker" highlightImage={images[1]} />);
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', images[1]);

    rerender(
      <Gallery
        productId="p1"
        images={images}
        alt="Sneaker"
        highlightImage="https://example.com/unknown.webp"
      />,
    );
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', images[1]);
  });

  it('toggles zoom from the keyboard and exits with Escape', async () => {
    const user = userEvent.setup();
    renderGallery();

    const zoom = screen.getByRole('button', { name: 'Zoom: Sneaker' });
    const mainImage = screen.getByTestId('gallery-main-image');
    zoom.focus();

    await user.keyboard('{Enter}');
    expect(zoom).toHaveAttribute('aria-pressed', 'true');
    expect(mainImage).toHaveStyle({ transform: 'scale(1.75)', transformOrigin: '50% 50%' });

    await user.keyboard('{Escape}');
    expect(zoom).toHaveAttribute('aria-pressed', 'false');

    await user.keyboard(' ');
    expect(zoom).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(zoom).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a thumbnail for every image, beyond the first five', async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 7 }, (_, index) => `https://example.com/${index}.webp`);
    const { rerender } = renderGallery({ images: many });
    rerender(<Gallery productId="p1" images={many} alt="Sneaker" highlightImage={many[6]} />);

    const thumbs = screen.getAllByRole('button', { name: /^view image/i });
    expect(thumbs).toHaveLength(7);
    expect(thumbs[6]).toHaveAttribute('aria-current', 'true');
    expect(thumbs[0]).not.toHaveAttribute('aria-current');
    expect(thumbs[6]).toHaveAccessibleName('View image 7 of 7');

    await user.click(thumbs[5]);
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', many[5]);
  });
});

describe('Gallery keyboard and pointer', () => {
  it('switches images with the arrow keys from anywhere in the gallery', async () => {
    const user = userEvent.setup();
    renderGallery();

    screen.getByRole('button', { name: 'Share product' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', images[1]);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('gallery-main-image')).toHaveAttribute('src', images[0]);
  });

  it('pans the zoomed image with pointer movement (mouse or touch)', async () => {
    const user = userEvent.setup();
    renderGallery();
    const zoom = screen.getByTestId('gallery-main');
    zoom.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 400 }) as DOMRect;

    await user.click(zoom);
    fireEvent.pointerMove(zoom, { clientX: 50, clientY: 300 });
    expect(screen.getByTestId('gallery-main-image')).toHaveStyle({ transformOrigin: '25% 75%' });
    expect(zoom).toHaveClass('touch-none');
  });
});

describe('Gallery share feedback', () => {
  const originalShare = navigator.share;

  afterEach(() => {
    Object.defineProperty(navigator, 'share', { value: originalShare, configurable: true });
    vi.restoreAllMocks();
  });

  function stubShare(impl: (() => Promise<void>) | undefined) {
    Object.defineProperty(navigator, 'share', { value: impl, configurable: true });
  }

  it('stays silent when the native share sheet is used or dismissed', async () => {
    const user = userEvent.setup();
    stubShare(() => Promise.reject(new DOMException('dismissed', 'AbortError')));
    renderGallery();

    await user.click(screen.getByRole('button', { name: 'Share product' }));
    expect(screen.getByTestId('share-status')).toBeEmptyDOMElement();
  });

  it('falls back to copying the link when native share fails', async () => {
    const user = userEvent.setup();
    stubShare(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')));
    renderGallery();

    await user.click(screen.getByRole('button', { name: 'Share product' }));
    expect(screen.getByTestId('share-status')).toHaveTextContent('Link copied');
  });

  it('reports a failure only when copying fails too', async () => {
    const user = userEvent.setup();
    stubShare(undefined);
    renderGallery();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

    await user.click(screen.getByRole('button', { name: 'Share product' }));
    expect(screen.getByTestId('share-status')).toHaveTextContent("Couldn't share this page");
  });
});
