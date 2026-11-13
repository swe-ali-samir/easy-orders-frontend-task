export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Collapsed excerpt length, ≈ 4 lines on desktop / 6 on mobile, as in the design. */
export const EXCERPT_LENGTH = 240;

/** Cuts at the last word boundary before `max` characters (the "See More...." link follows it). */
export function excerpt(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:]+$/, '');
}
