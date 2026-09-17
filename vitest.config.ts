import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 15000,
    // Bound concurrent native workers on the Windows Studio development host.
    maxWorkers: 2,
  },
});
