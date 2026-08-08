import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:8080',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node dev-server.js',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
