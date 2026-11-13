import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the production build (`vite preview`) in the locally installed
 * Chrome (`channel: 'chrome'`), so no Playwright browser download is needed.
 * The product API and image CDN are mocked per test (see e2e/support.ts) for
 * determinism. The `live` project (`npm run test:e2e:live`) runs a smoke test against the
 * real API instead; it is excluded from the default run because it depends on the network.
 */
const PORT = 4180;
const LIVE_SPEC = /live\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: LIVE_SPEC,
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testIgnore: LIVE_SPEC,
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        userAgent: devices['Pixel 7'].userAgent,
      },
    },
    {
      name: 'live',
      testMatch: LIVE_SPEC,
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
