import type { Page } from "@playwright/test";

export async function workspacePage(
  page: Page,
  use: (page: Page) => Promise<void>,
) {
  await page.route("**/api/status", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: {
        ...(await response.json()),
        studioConnectionGate: false,
        proposals: false,
      },
    });
  });
  try {
    await use(page);
  } finally {
    // Polling can enter a route handler just as the test finishes. Drain it while
    // the request context is still alive, before Playwright disposes responses.
    await page.unrouteAll({ behavior: "wait" });
  }
}
