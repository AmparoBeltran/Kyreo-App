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
    baseURL: "http://127.0.0.1:5000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  /*
   * The Firebase Hosting emulator, not a generic static server.
   *
   * It reads firebase.json, so these tests exercise the real production
   * semantics: trailingSlash resolution, the Cache-Control headers, and — the
   * one that matters most here — serving out/404.html with a genuine 404 for an
   * unmatched URL. A plain static server returns a bare 404 body, which would
   * make the "unknown URL is not the homepage" test pass while proving nothing
   * about what Hosting actually does.
   *
   * It is Node-based, so unlike the Firestore emulator it needs no JDK.
   */
  webServer: {
    command: "npx firebase emulators:start --only hosting --project kyreo-app",
    url: "http://127.0.0.1:5000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
