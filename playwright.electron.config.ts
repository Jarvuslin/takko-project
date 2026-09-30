import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/electron", workers: 1, timeout: 90000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["json", { outputFile: "test-artifacts/chat-clean-electron.json" }]],
  outputDir: "test-artifacts/chat-clean-electron", use: { trace: "retain-on-failure" },
});
