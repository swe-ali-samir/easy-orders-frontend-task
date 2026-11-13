/**
 * Page list with ellipses, e.g. [1, 2, 'ellipsis', 19] — keeps first, last and
 * the neighbours of the current page.
 */
export function getPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const items: Array<number | 'ellipsis'> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  });
  return items;
}
