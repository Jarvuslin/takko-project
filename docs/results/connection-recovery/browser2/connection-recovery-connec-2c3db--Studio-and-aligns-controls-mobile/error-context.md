# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: connection-recovery.spec.ts >> connection refresh shows progress, retries failed discovery, clears stale Studio and aligns controls
- Location: tests\browser\connection-recovery.spec.ts:5:1

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('dialog', { name: 'Choose assets', exact: true }).getByRole('button', { name: 'Checking…', exact: true })
Expected: disabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeDisabled" getByRole('dialog', { name: 'Choose assets', exact: true }).getByRole('button', { name: 'Checking…', exact: true }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Choose assets', exact: true }).getByRole('button', { name: 'Checking…', exact: true })

```

```yaml
- complementary:
  - link "Takko home":
    - /url: /
    - text: takko
  - button "New project"
  - button "Marketplace"
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
- main:
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - option "I want a combat game with basic fighting and a target dummy to p" [selected]
  - region "Game architecture":
    - strong: Game architecture
    - text: draft · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - strong: Start with your first game system
    - paragraph: Describe your game to Takko, or add a system using the toolbar.
    - button "Ask Takko"
    - img "System connections"
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - heading "I want a combat game with basic fighting and a target dummy to p" [level=1]
  - region "Project conversation":
    - strong: Takko
    - text: draft
    - button "Latest ↓"
    - button "History"
    - text: $0.0000 / $2.0000
    - article:
      - strong: Takko
      - text: r1 · 01:19 AM
      - paragraph: Saved project. Earlier conversation was not recorded. I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx
    - group: Preview an animation clip
    - region "Studio in conversation"
    - group: Edit original brief
    - button "Shape my idea"
    - button "Approve brief"
    - button "Plan this game ↗"
    - button "Configure models"
    - paragraph: Shape your idea, then review the plan before building. Uses your planner and generation budget.
    - region "Assets for your brief":
      - text: ASSETS FOR YOUR BRIEF
      - heading "Find your game’s look and movement" [level=2]
      - paragraph: 6 asset groups · preview a few options and choose what fits.
      - button "Preview & choose assets"
    - paragraph: Your build plan appears after planning.
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Enter to send · Shift + Enter for a new line
- dialog "Choose assets":
  - banner:
    - heading "Choose assets" [level=2]
    - button "Close dialog"
  - paragraph: Preview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.
  - region "Studio connection":
    - status:
      - strong: Studio connected
    - text: Studio
    - combobox "Asset search Studio":
      - option "Select Studio"
      - option "Training yard" [selected]
    - button "Refresh connection"
  - navigation "Asset groups":
    - button "Practice dummy" [pressed]
    - button "Fighting animation"
    - button "Sprint animation"
    - button "Walk animation"
    - button "Sound effects"
    - button "Visual effects"
  - region "Practice dummy":
    - heading "Practice dummy" [level=3]
    - textbox "Search for Practice dummy": training dummy
    - button "Search again"
    - article:
      - strong: Practice dummy option 1
      - text: "Offline fixture · #1001 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 2
      - text: "Offline fixture · #1002 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 3
      - text: "Offline fixture · #1003 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 4
      - text: "Offline fixture · #1004 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 5
      - text: "Offline fixture · #1005 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 6
      - text: "Offline fixture · #1006 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 7
      - text: "Offline fixture · #1007 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 8
      - text: "Offline fixture · #1008 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 9
      - text: "Offline fixture · #1009 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 10
      - text: "Offline fixture · #1010 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 11
      - text: "Offline fixture · #1011 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 12
      - text: "Offline fixture · #1012 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 13
      - text: "Offline fixture · #1013 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 14
      - text: "Offline fixture · #1014 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 15
      - text: "Offline fixture · #1015 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 16
      - text: "Offline fixture · #1016 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 17
      - text: "Offline fixture · #1017 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 18
      - text: "Offline fixture · #1018 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 19
      - text: "Offline fixture · #1019 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 20
      - text: "Offline fixture · #1020 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 21
      - text: "Offline fixture · #1021 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 22
      - text: "Offline fixture · #1022 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 23
      - text: "Offline fixture · #1023 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 24
      - text: "Offline fixture · #1024 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 25
      - text: "Offline fixture · #1025 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 26
      - text: "Offline fixture · #1026 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 27
      - text: "Offline fixture · #1027 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 28
      - text: "Offline fixture · #1028 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 29
      - text: "Offline fixture · #1029 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - article:
      - strong: Practice dummy option 30
      - text: "Offline fixture · #1030 👍 92% · 100 votes"
      - button "Preview"
      - button "Select"
    - text: 30 loaded · Free · Creator Store relevance
    - button "Load more results"
    - radio "Find later"
    - text: Find later
  - contentinfo:
    - paragraph: Approve the brief in the conversation before approving these choices.
    - button "Approve assets & create plan" [disabled]
```

# Test source

```ts
  1   | import { expect, type Page, type Locator } from "@playwright/test";
  2   | import { assetChoiceFixture, studioId } from "./asset-choices-fixture";
  3   | 
  4   | async function aligned(field: Locator, button: Locator) {
  5   |   const a = (await field.boundingBox())!,
  6   |     b = (await button.boundingBox())!;
  7   |   expect(Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
  8   |   // Narrow windows may wrap the entire action, never offset a shared row.
  9   |   if (b.x >= a.x + a.width) expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
  10  | }
  11  | export async function connectionRecoveryFlow(
  12  |   page: Page,
  13  |   origin = "",
  14  |   screenshot?: string,
  15  | ) {
  16  |   await page.route("**/api/status", (r) =>
  17  |     r.fulfill({
  18  |       json: {
  19  |         concepts: true,
  20  |         assetChoices: true,
  21  |         studioConnectionGate: false,
  22  |         studios: [],
  23  |       },
  24  |     }),
  25  |   );
  26  |   const f = await assetChoiceFixture(page, origin);
  27  |   await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  28  |   f.project().assetDiscovery = undefined;
  29  |   let searches = 0,
  30  |     checks = 0;
  31  |   let release: (() => void) | undefined;
  32  |   let mode = "ready";
  33  |   await page.route("**/api/projects/*/asset-options", async (r) => {
  34  |     searches++;
  35  |     if (searches === 1)
  36  |       return r.fulfill({
  37  |         status: 503,
  38  |         json: { error: "Search temporarily unavailable" },
  39  |       });
  40  |     return r.fallback();
  41  |   });
  42  |   await page.route("**/api/marketplace/studios", async (r) => {
  43  |     checks++;
  44  |     if (mode === "hold")
  45  |       await new Promise<void>((resolve) => {
  46  |         release = resolve;
  47  |       });
  48  |     if (mode === "error")
  49  |       return r.fulfill({
  50  |         status: 503,
  51  |         json: { error: "Studio connector unavailable" },
  52  |       });
  53  |     return r.fulfill({
  54  |       json: { studios: [{ id: studioId, name: "Training yard" }] },
  55  |     });
  56  |   });
  57  |   await page.reload();
  58  |   await page
  59  |     .getByRole("button", { name: "Preview & choose assets", exact: true })
  60  |     .click();
  61  |   const dialog = page.getByRole("dialog", {
  62  |     name: "Choose assets",
  63  |     exact: true,
  64  |   });
  65  |   await expect(dialog).toContainText("Studio connected");
  66  |   await expect(dialog).toContainText("Search temporarily unavailable");
  67  |   const refresh = dialog.getByRole("button", {
  68  |     name: "Refresh connection",
  69  |     exact: true,
  70  |   });
  71  |   await aligned(dialog.getByLabel("Asset search Studio"), refresh);
  72  |   await refresh.click();
  73  |   await expect(
  74  |     dialog.getByRole("button", { name: "Checking…", exact: true }),
> 75  |   ).toBeDisabled();
      |     ^ Error: expect(locator).toBeDisabled() failed
  76  |   await expect(
  77  |     dialog.locator(".marketplace-connection .spinner"),
  78  |   ).toBeVisible();
  79  |   expect(searches).toBe(1);
  80  |   mode = "ready";
  81  |   release!();
  82  |   await expect(dialog.getByRole("article")).toHaveCount(30);
  83  |   expect(searches).toBe(2);
  84  |   await aligned(
  85  |     dialog.getByLabel("Search for Practice dummy"),
  86  |     dialog.getByRole("button", { name: "Search again", exact: true }),
  87  |   );
  88  |   if (screenshot) await page.screenshot({ path: screenshot });
  89  |   mode = "error";
  90  |   await refresh.click();
  91  |   await expect(dialog).toContainText("Connection check failed");
  92  |   await expect(dialog.getByLabel("Asset search Studio")).toHaveValue("");
  93  |   await expect(dialog).not.toContainText("Studio connected");
  94  |   mode = "ready";
  95  |   await refresh.click();
  96  |   await expect(dialog).toContainText("Studio connected");
  97  |   expect(searches).toBe(2); // Existing choices/results are not reset by refresh.
  98  |   expect(f.errors).toEqual([]);
  99  |   return { checks, searches };
  100 | }
  101 | 
```