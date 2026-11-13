import { ProductImage } from '../../../components/ui/ProductImage';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
} from '../../../components/ui/icons';
import { useWishlistStore } from '../../../store/wishlist-store';
import { cn } from '../../../utils/cn';
import { useGalleryNavigation } from '../hooks/use-gallery-navigation';
import { useImageZoom } from '../hooks/use-image-zoom';
import { useShareLink } from '../hooks/use-share-link';

interface GalleryProps {
  productId: string;
  images: string[];
  alt: string;
  highlightImage?: string;
}

const railButton =
  'flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition hover:bg-gray-200 lg:h-14 lg:w-14';

export function Gallery({ productId, images, alt, highlightImage }: GalleryProps) {
  const { activeIndex, activeImage, select, showPrevious, showNext, handleKeyDown, stripRef } =
    useGalleryNavigation(images, highlightImage);
  const { zoomed, zoomHandlers, imageStyle } = useImageZoom();
  const { share, status: shareStatus } = useShareLink(alt);
  const wishlisted = useWishlistStore((state) => state.ids.includes(productId));
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  if (images.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Product gallery"
      onKeyDown={handleKeyDown}
      className="grid grid-cols-[minmax(0,1fr)_auto] content-start self-start gap-x-4 gap-y-4 lg:gap-x-10 lg:gap-y-6"
    >
      <button
        type="button"
        data-testid="gallery-main"
        aria-label={`Zoom: ${alt}`}
        aria-pressed={zoomed}
        className={cn(
          'relative block aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
          zoomed ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in',
        )}
        {...zoomHandlers}
      >
        <ProductImage
          key={activeImage}
          src={activeImage}
          alt={alt}
          eager
          fetchPriority="high"
          className="animate-fadeIn transition-transform duration-300 motion-reduce:animate-none motion-reduce:transition-none"
          data-testid="gallery-main-image"
          style={imageStyle}
        />
      </button>

      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-3 lg:gap-5">
          <div className="relative">
            <button type="button" aria-label="Share product" onClick={share} className={railButton}>
              <ShareIcon />
            </button>
            <p
              role="status"
              data-testid="share-status"
              className={cn(
                'absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-gray-950 px-2.5 py-1.5 text-xs font-medium text-white shadow lg:left-full lg:right-auto lg:top-1/2 lg:ml-3 lg:mt-0 lg:-translate-y-1/2',
                shareStatus === 'idle' && 'sr-only',
              )}
            >
              {shareStatus === 'copied' && 'Link copied'}
              {shareStatus === 'error' && "Couldn't share this page"}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={wishlisted}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={() => toggleWishlist(productId)}
            className={cn(railButton, wishlisted && 'text-red-600')}
          >
            <HeartIcon filled={wishlisted} />
          </button>
        </div>
        <div className="flex flex-col gap-3 lg:gap-5">
          <button
            type="button"
            aria-label="Previous image"
            onClick={showPrevious}
            className={railButton}
          >
            <ChevronLeftIcon />
          </button>
          <button type="button" aria-label="Next image" onClick={showNext} className={railButton}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div
        ref={stripRef}
        role="group"
        aria-label="Image thumbnails"
        className="relative col-span-2 flex snap-x gap-4 overflow-x-auto md:col-span-1 lg:gap-5"
      >
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={`View image ${index + 1} of ${images.length}`}
            onClick={() => select(index)}
            className={cn(
              'aspect-[3/4] w-14 shrink-0 snap-start overflow-hidden rounded-md border bg-gray-100 transition md:w-[calc((100%-4rem)/5)] lg:w-[calc((100%-5rem)/5)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900',
              index === activeIndex
                ? 'border-gray-900'
                : 'border-transparent hover:border-gray-300',
            )}
          >
            <ProductImage src={image} alt="" />
          </button>
        ))}
      </div>
    </section>
  );
}
