import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://app.wingify.com',
    browserName: 'chromium',
    channel: 'chrome',
    headless: false,
    viewport: { width: 1440, height: 960 },
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
  outputDir: 'test-results',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
});
