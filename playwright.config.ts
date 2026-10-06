import { defineConfig, devices } from '@playwright/test';

if (!process.env.BASE_URL) throw new Error('BASE_URL is required, e.g. $env:BASE_URL="https://justinchewej.github.io/JustinCEJ-site/"');

export default defineConfig({
  testDir: './tests',
  use: { baseURL: process.env.BASE_URL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['list'], ['html', { open: 'never' }]],
});
