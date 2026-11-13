import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';

const ZOOM_SCALE = 1.75;
const CENTER = { x: 50, y: 50 };

/** Checked at event time (not per render): hybrid devices can switch input modes. */
function supportsHover(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

/**
 * Zoom for the main gallery image: hover zoom (mouse), click / Enter / Space toggle,
 * Escape or blur to exit, and panning by pointer (mouse or touch) while zoomed.
 * Spread `zoomHandlers` on the zoom surface and apply `imageStyle` to the image.
 */
export function useImageZoom() {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState(CENTER);

  const zoomHandlers = {
    onMouseEnter: () => supportsHover() && setZoomed(true),
    onMouseLeave: () => supportsHover() && setZoomed(false),
    // Pointer events cover mouse and touch: while zoomed, dragging a finger pans the image.
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      // detail === 0 means keyboard activation: zoom into the centre, not the last mouse position.
      if (event.detail === 0) {
        setOrigin(CENTER);
      }
      setZoomed((current) => !current);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        setZoomed(false);
      }
    },
    onBlur: () => setZoomed(false),
  };

  const imageStyle: CSSProperties = {
    transform: zoomed ? `scale(${ZOOM_SCALE})` : undefined,
    transformOrigin: `${origin.x}% ${origin.y}%`,
  };

  return { zoomed, zoomHandlers, imageStyle };
}
