import { defineConfig, devices } from "@playwright/test";

/**
 * E2E and responsive tests run against the real static export, not `next dev`,
 * so what is tested is what Firebase Hosting will serve — including the
 * directory/index.html layout that makes deep links resolve.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3212",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx --yes http-server out -p 3212 --silent",
    url: "http://127.0.0.1:3212",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
