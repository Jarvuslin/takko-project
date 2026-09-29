# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: connection-recovery.spec.ts >> connection refresh shows progress, retries failed discovery, clears stale Studio and aligns controls
- Location: tests\browser\connection-recovery.spec.ts:5:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('dialog', { name: 'Choose assets', exact: true })
Expected substring: "Studio connected"
Received string:    "Choose assetsPreview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.Checking Studio…StudioSelect StudioChecking…Connect StudioFind assetsApprove the brief in the conversation before approving these choices.Approve assets & create plan"
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByRole('dialog', { name: 'Choose assets', exact: true }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Choose assets', exact: true })
    14 × locator resolved to <dialog open="" data-modal="true" class="focused-dialog" data-scroll-body="true" aria-label="Choose assets">…</dialog>
       - unexpected value "Choose assetsPreview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.Checking Studio…StudioSelect StudioChecking…Connect StudioFind assetsApprove the brief in the conversation before approving these choices.Approve assets & create plan"

```

```yaml
- dialog "Choose assets":
  - banner:
    - heading "Choose assets" [level=2]
    - button "Close dialog"
  - paragraph: Preview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.
  - region "Studio connection":
    - status:
      - strong: Checking Studio…
    - text: Studio
    - combobox "Asset search Studio" [disabled]:
      - option "Select Studio" [selected]
    - button "Checking…" [disabled]
    - button "Connect Studio"
    - button "Find assets" [disabled]
  - navigation "Asset groups"
  - contentinfo:
    - paragraph: Approve the brief in the conversation before approving these choices.
    - button "Approve assets & create plan" [disabled]
```

# Test source

```ts
  1  | import { expect, type Page, type Locator } from "@playwright/test";
  2  | import { assetChoiceFixture, studioId } from "./asset-choices-fixture";
  3  | 
  4  | async function aligned(field: Locator, button: Locator) {
  5  |   const a = (await field.boundingBox())!,
  6  |     b = (await button.boundingBox())!;
  7  |   expect(Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
  8  |   // Narrow windows may wrap the entire action, never offset a shared row.
  9  |   if (b.x >= a.x + a.width) expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
  10 | }
  11 | export async function connectionRecoveryFlow(
  12 |   page: Page,
  13 |   origin = "",
  14 |   screenshot?: string,
  15 | ) {
  16 |   await page.route("**/api/status", (r) =>
  17 |     r.fulfill({
  18 |       json: {
  19 |         concepts: true,
  20 |         assetChoices: true,
  21 |         studioConnectionGate: false,
  22 |         studios: [],
  23 |       },
  24 |     }),
  25 |   );
  26 |   const f = await assetChoiceFixture(page, origin);
  27 |   await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  28 |   f.project().assetDiscovery = undefined;
  29 |   let searches = 0,
  30 |     checks = 0;
  31 |   let release: (() => void) | undefined;
  32 |   await page.route("**/api/projects/*/asset-options", async (r) => {
  33 |     searches++;
  34 |     if (searches === 1)
  35 |       return r.fulfill({
  36 |         status: 503,
  37 |         json: { error: "Search temporarily unavailable" },
  38 |       });
  39 |     return r.fallback();
  40 |   });
  41 |   await page.route("**/api/marketplace/studios", async (r) => {
  42 |     checks++;
  43 |     if (checks === 2)
  44 |       await new Promise<void>((resolve) => {
  45 |         release = resolve;
  46 |       });
  47 |     if (checks === 3)
  48 |       return r.fulfill({
  49 |         status: 503,
  50 |         json: { error: "Studio connector unavailable" },
  51 |       });
  52 |     return r.fulfill({
  53 |       json: { studios: [{ id: studioId, name: "Training yard" }] },
  54 |     });
  55 |   });
  56 |   await page.reload();
  57 |   await page
  58 |     .getByRole("button", { name: "Preview & choose assets", exact: true })
  59 |     .click();
  60 |   const dialog = page.getByRole("dialog", {
  61 |     name: "Choose assets",
  62 |     exact: true,
  63 |   });
> 64 |   await expect(dialog).toContainText("Studio connected");
     |                        ^ Error: expect(locator).toContainText(expected) failed
  65 |   await expect(dialog).toContainText("Search temporarily unavailable");
  66 |   const refresh = dialog.getByRole("button", {
  67 |     name: "Refresh connection",
  68 |     exact: true,
  69 |   });
  70 |   await aligned(dialog.getByLabel("Asset search Studio"), refresh);
  71 |   await refresh.click();
  72 |   await expect(
  73 |     dialog.getByRole("button", { name: "Checking…", exact: true }),
  74 |   ).toBeDisabled();
  75 |   await expect(
  76 |     dialog.locator(".marketplace-connection .spinner"),
  77 |   ).toBeVisible();
  78 |   expect(searches).toBe(1);
  79 |   release!();
  80 |   await expect(dialog.getByRole("article")).toHaveCount(30);
  81 |   expect(searches).toBe(2);
  82 |   await aligned(
  83 |     dialog.getByLabel("Search for Practice dummy"),
  84 |     dialog.getByRole("button", { name: "Search again", exact: true }),
  85 |   );
  86 |   if (screenshot) await page.screenshot({ path: screenshot });
  87 |   await refresh.click();
  88 |   await expect(dialog).toContainText("Connection check failed");
  89 |   await expect(dialog.getByLabel("Asset search Studio")).toHaveValue("");
  90 |   await expect(dialog).not.toContainText("Studio connected");
  91 |   await refresh.click();
  92 |   await expect(dialog).toContainText("Studio connected");
  93 |   expect(searches).toBe(2); // Existing choices/results are not reset by refresh.
  94 |   expect(f.errors).toEqual([]);
  95 |   return { checks, searches };
  96 | }
  97 | 
```