import type { ImgHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { ImageOffIcon } from './icons';
import { useImageRetry } from '../../hooks/use-image-retry';

interface ProductImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  eager?: boolean;
}

export function ProductImage({
  src,
  alt,
  eager = false,
  className,
  onError,
  ...rest
}: ProductImageProps) {
  const { failed, attempt, currentSrc, handleError } = useImageRetry(src);

  if (failed) {
    return (
      <div
        data-testid="image-fallback"
        {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
        className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400"
      >
        <ImageOffIcon className="h-1/4 max-h-10 w-1/4 max-w-10" />
      </div>
    );
  }

  return (
    <img
      key={attempt}
      src={currentSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-full w-full object-contain mix-blend-multiply', className)}
      onError={(event) => {
        handleError();
        onError?.(event);
      }}
      {...rest}
    />
  );
}
