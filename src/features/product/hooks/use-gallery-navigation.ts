import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

/**
 * Which gallery image is shown, and how the user moves between images: thumbnails,
 * previous/next (wrapping), ←/→ keys, and jumping to `highlightImage` when it changes
 * (e.g. a colour is picked). Keeps the active thumbnail scrolled into view in its strip.
 */
export function useGalleryNavigation(images: string[], highlightImage?: string) {
  // Start on the highlighted image (e.g. the pre-selected colour), not always the first.
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, highlightImage ? images.indexOf(highlightImage) : 0),
  );
  const [prevHighlight, setPrevHighlight] = useState(highlightImage);
  const stripRef = useRef<HTMLDivElement>(null);

  // Jump to a newly highlighted image (derived state; no effect needed).
  if (highlightImage !== prevHighlight) {
    setPrevHighlight(highlightImage);
    const index = highlightImage ? images.indexOf(highlightImage) : -1;
    if (index !== -1) {
      setActiveIndex(index);
    }
  }

  // Keep the active thumbnail visible. Scrolls only the strip (never the page).
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[activeIndex] as HTMLElement | undefined;
    if (!strip || !thumb) {
      return;
    }
    const thumbEnd = thumb.offsetLeft + thumb.offsetWidth;
    if (thumb.offsetLeft < strip.scrollLeft) {
      strip.scrollTo({ left: thumb.offsetLeft, behavior: 'smooth' });
    } else if (thumbEnd > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: thumbEnd - strip.clientWidth, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  // ArrowLeft/ArrowRight anywhere in the gallery switch images.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    }
  };

  return {
    activeIndex,
    activeImage: images[activeIndex] ?? images[0],
    select: setActiveIndex,
    showPrevious,
    showNext,
    handleKeyDown,
    stripRef,
  };
}
