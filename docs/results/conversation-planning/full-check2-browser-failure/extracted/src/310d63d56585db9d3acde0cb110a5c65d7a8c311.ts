// Existing workspace tests exercise the prior-server compatibility path.
// studio-connection.spec.ts independently covers the current connection gate.
import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/api/status", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        json: { ...(await response.json()), studioConnectionGate: false },
      });
    });
    await use(page);
  },
});
export { expect };
export type { Page, Locator } from "@playwright/test";
