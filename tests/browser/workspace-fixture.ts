// Existing workspace tests exercise the prior-server compatibility path.
// studio-connection.spec.ts independently covers the current connection gate.
import { test as base, expect } from "@playwright/test";
import { workspacePage } from "../workspace-page";
export const test = base.extend({
  page: async ({ page }, use) => {
    await workspacePage(page, use);
  },
});
export { expect };
export type { Page, Locator } from "@playwright/test";
