import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
timeout: 90_000,
use: {
headless: true,
viewport: { width: 1280, height: 800 },
trace: 'retain-on-failure',
screenshot: 'only-on-failure'
},
projects: [
{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }
]
});