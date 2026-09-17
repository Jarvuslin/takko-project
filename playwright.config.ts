import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4319", trace: "retain-on-failure" },
  webServer: {
    command: "npm run build && npm run dev",
    url: "http://127.0.0.1:4319",
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      FORGE_DATA_DIR: ".forge/e2e-projects",
      FORGE_PORT: "4319",
      NODE_ENV: "production",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
