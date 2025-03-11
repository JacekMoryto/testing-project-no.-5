import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config({ path: path.resolve(__dirname, 'e2e/config/.env') });

export const STORAGE_STATE = path.resolve(__dirname, 'e2e/auth/session.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'login',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/login.setup.ts',
    },
    {
      name: 'Logged In tests',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['login'],
     // teardown: 'teardown',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/signup.spec.ts',
    },
    {
      name: 'Logged out tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/signup.spec.ts',
    },
    {
      name: 'teardown',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/global.teardown.ts',
    },
  ],
});
