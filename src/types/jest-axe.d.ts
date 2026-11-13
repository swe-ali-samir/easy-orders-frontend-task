declare module 'jest-axe' {
  import type { AxeResults } from 'axe-core';

  export function axe(element: Element | Document | string): Promise<AxeResults>;
}
