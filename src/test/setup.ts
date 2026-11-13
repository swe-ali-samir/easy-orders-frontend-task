import '@testing-library/jest-dom/vitest';

// In the app the lazy cart drawer chunk is prefetched on idle (LazyCartDrawer). Mirror that
// here so a test's first open is not slowed by Vitest compiling the module on demand.
await import('../features/cart/components/CartDrawer');

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});
