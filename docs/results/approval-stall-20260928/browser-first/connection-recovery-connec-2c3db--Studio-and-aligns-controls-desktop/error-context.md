# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: connection-recovery.spec.ts >> connection refresh shows progress, retries failed discovery, clears stale Studio and aligns controls
- Location: tests\browser\connection-recovery.spec.ts:5:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('dialog', { name: 'Choose assets', exact: true }).getByRole('article')
Expected: 30
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('dialog', { name: 'Choose assets', exact: true }).getByRole('article') with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Choose assets', exact: true }).getByRole('article')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - link "Takko home" [ref=f1e5] [cursor=pointer]:
      - /url: /
    - button "New project" [ref=f1e8] [cursor=pointer]
    - button "Marketplace" [ref=f1e12] [cursor=pointer]
    - navigation "Workspace" [ref=f1e16]:
      - button "Models" [ref=f1e17] [cursor=pointer]
      - button "Presets" [ref=f1e21] [cursor=pointer]
    - group [ref=f1e25]:
      - generic "Projects" [ref=f1e26] [cursor=pointer]
    - link "Download plugin" [ref=f1e31] [cursor=pointer]:
      - /url: /api/studio/plugin
  - main [ref=f1e35]:
    - generic [ref=f1e36]:
      - generic [ref=f1e37]: Workspace/I want a combat game with basic fighting and a target dummy to p
      - generic [ref=f1e38]:
        - button "Connect to Studio" [ref=f1e39] [cursor=pointer]
        - button "Models" [ref=f1e41] [cursor=pointer]
    - generic [ref=f1e44]:
      - region "Game architecture" [ref=f1e45]:
        - generic [ref=f1e46]:
          - generic [ref=f1e47]:
            - generic [ref=f1e48]: Your game, connected
            - strong [ref=f1e49]: Game architecture
            - generic [ref=f1e50]: draft · Game architecture
          - generic [ref=f1e51]:
            - button "Build details" [ref=f1e52] [cursor=pointer]: Build
            - button "Source details" [ref=f1e53] [cursor=pointer]: Source
            - button "Studio details" [ref=f1e54] [cursor=pointer]: Studio
        - generic [ref=f1e55]:
          - generic [ref=f1e56]: 0 systems · 0 connections
          - button "Connections" [ref=f1e57] [cursor=pointer]
          - button "Add system" [ref=f1e58] [cursor=pointer]
        - generic "Architecture canvas" [ref=f1e59]:
          - generic [ref=f1e60]:
            - strong [ref=f1e61]: Start with your first game system
            - paragraph [ref=f1e62]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=f1e63] [cursor=pointer]
            - generic [ref=f1e64]: Combat · Inventory · Quests
          - generic [ref=f1e65]:
            - img "System connections"
        - generic "Canvas controls" [ref=f1e66]:
          - button "Zoom out canvas" [ref=f1e67] [cursor=pointer]: −
          - generic [ref=f1e68]: 100%
          - button "Zoom in canvas" [ref=f1e69] [cursor=pointer]: +
          - button "Fit" [ref=f1e70] [cursor=pointer]
          - button "Auto layout" [ref=f1e71] [cursor=pointer]
      - separator "Resize Takko panel" [ref=f1e72]
      - heading "I want a combat game with basic fighting and a target dummy to p" [level=1] [ref=f1e73]
      - region "Project conversation" [ref=f1e74]:
        - generic [ref=f1e75]:
          - strong [ref=f1e77]: Takko
          - generic [ref=f1e78]: draft
          - button "Latest ↓" [ref=f1e79] [cursor=pointer]
          - button "History" [ref=f1e80] [cursor=pointer]
        - generic [ref=f1e83]:
          - generic [ref=f1e84]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=f1e86]:
            - article [ref=f1e87]:
              - generic [ref=f1e88]:
                - strong [ref=f1e89]: Takko
                - generic [ref=f1e90]: r1 · 07:15 PM
              - paragraph [ref=f1e91]: Saved project. Earlier conversation was not recorded. I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx
          - group [ref=f1e92]:
            - generic "Preview an animation clip" [ref=f1e93] [cursor=pointer]
          - generic [ref=f1e94]:
            - generic [ref=f1e95]:
              - region "Studio in conversation"
              - group [ref=f1e96]:
                - generic "Edit original brief" [ref=f1e97] [cursor=pointer]
              - generic [ref=f1e98]:
                - button "Shape my idea" [ref=f1e99] [cursor=pointer]
                - button "Approve brief" [ref=f1e100] [cursor=pointer]
                - button "Plan this game ↗" [ref=f1e101] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=f1e102]: ↗
                - button "Configure models" [ref=f1e103] [cursor=pointer]
              - paragraph [ref=f1e104]: Shape your idea, then review the plan before building. Uses your planner and generation budget.
              - region "Assets for your brief" [ref=f1e105]:
                - generic [ref=f1e106]:
                  - text: ASSETS FOR YOUR BRIEF
                  - heading "Find your game’s look and movement" [level=2] [ref=f1e107]
                - paragraph [ref=f1e108]: Takko searches the free Creator Store using your brief. Nothing is inserted yet.
                - button "Preview & choose assets" [ref=f1e110] [cursor=pointer]
            - paragraph [ref=f1e111]: Your build plan appears after planning.
        - generic [ref=f1e112]:
          - generic [ref=f1e113]: Message
          - textbox "Message" [ref=f1e114]:
            - /placeholder: What would you like to add or change?
          - generic [ref=f1e115]:
            - button "Browse Marketplace assets" [ref=f1e116] [cursor=pointer]
            - button "Attach Studio feedback" [ref=f1e119] [cursor=pointer]
            - button "Presets" [ref=f1e122] [cursor=pointer]
            - button "Budget for this generation" [ref=f1e125] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=f1e126]
          - generic [ref=f1e129]: Enter to send · Shift + Enter for a new line
  - dialog "Choose assets" [ref=f1e130]:
    - banner [ref=f1e131]:
      - heading "Choose assets" [level=2] [ref=f1e133]
      - button "Close dialog" [ref=f1e134] [cursor=pointer]
    - generic [ref=f1e138]:
      - paragraph [ref=f1e139]: Preview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.
      - region "Studio connection" [ref=f1e140]:
        - status [ref=f1e141]:
          - strong [ref=f1e143]: Studio connected
        - generic [ref=f1e144]:
          - generic [ref=f1e145]:
            - text: Studio
            - combobox "Asset search Studio" [ref=f1e146]:
              - option "Select Studio"
              - option "Training yard" [selected]
          - button "Refresh connection" [ref=f1e147] [cursor=pointer]
          - button "Find assets" [ref=f1e148] [cursor=pointer]
      - alert [ref=f1e149]: Search temporarily unavailable
      - paragraph [ref=f1e150]: Choose Find assets to search the Creator Store using your saved brief.
      - navigation "Asset groups"
      - contentinfo [ref=f1e151]:
        - paragraph [ref=f1e152]: Approve the brief in the conversation before approving these choices.
        - button "Approve assets & create plan" [disabled] [ref=f1e153]
```

# Test source

```ts
  1   | import { expect, type Page, type Locator } from "@playwright/test";
  2   | import { assetChoiceFixture, studioId } from "./asset-choices-fixture";
  3   | 
  4   | export async function aligned(field: Locator, button: Locator) {
  5   |   // Modal entrance transforms can change between two locator reads. Wait for
  6   |   // the measured row to settle rather than relaxing the one-pixel tolerance.
  7   |   await expect
  8   |     .poll(async () => {
  9   |       const [a, b] = await Promise.all([
  10  |         field.boundingBox(),
  11  |         button.boundingBox(),
  12  |       ]);
  13  |       if (!a || !b) return Infinity;
  14  |       return Math.max(
  15  |         Math.abs(a.height - b.height),
  16  |         b.x >= a.x + a.width ? Math.abs(a.y - b.y) : 0,
  17  |       );
  18  |     })
  19  |     .toBeLessThanOrEqual(1);
  20  | }
  21  | export async function connectionRecoveryFlow(
  22  |   page: Page,
  23  |   origin = "",
  24  |   screenshot?: string,
  25  | ) {
  26  |   await page.route("**/api/status", (r) =>
  27  |     r.fulfill({
  28  |       json: {
  29  |         concepts: true,
  30  |         assetChoices: true,
  31  |         studioConnectionGate: false,
  32  |         studios: [],
  33  |       },
  34  |     }),
  35  |   );
  36  |   const f = await assetChoiceFixture(page, origin);
  37  |   await expect.poll(() => f.calls.includes("asset-options")).toBe(true);
  38  |   f.project().assetDiscovery = undefined;
  39  |   let searches = 0,
  40  |     checks = 0;
  41  |   let release: (() => void) | undefined;
  42  |   let mode = "ready";
  43  |   await page.route("**/api/projects/*/asset-options", async (r) => {
  44  |     searches++;
  45  |     if (searches === 1)
  46  |       return r.fulfill({
  47  |         status: 503,
  48  |         json: { error: "Search temporarily unavailable" },
  49  |       });
  50  |     return r.fallback();
  51  |   });
  52  |   await page.route("**/api/marketplace/studios", async (r) => {
  53  |     checks++;
  54  |     if (mode === "hold")
  55  |       await new Promise<void>((resolve) => {
  56  |         release = resolve;
  57  |       });
  58  |     if (mode === "error")
  59  |       return r.fulfill({
  60  |         status: 503,
  61  |         json: { error: "Studio connector unavailable" },
  62  |       });
  63  |     return r.fulfill({
  64  |       json: { studios: [{ id: studioId, name: "Training yard" }] },
  65  |     });
  66  |   });
  67  |   await page.reload();
  68  |   await page
  69  |     .getByRole("button", { name: "Preview & choose assets", exact: true })
  70  |     .click();
  71  |   const dialog = page.getByRole("dialog", {
  72  |     name: "Choose assets",
  73  |     exact: true,
  74  |   });
  75  |   await expect(dialog).toContainText("Studio connected");
  76  |   await expect(dialog).toContainText("Search temporarily unavailable");
  77  |   const refresh = dialog.getByRole("button", {
  78  |     name: "Refresh connection",
  79  |     exact: true,
  80  |   });
  81  |   await aligned(dialog.getByLabel("Asset search Studio"), refresh);
  82  |   mode = "hold";
  83  |   await refresh.click();
  84  |   await expect(
  85  |     dialog.getByRole("button", { name: "Checking…", exact: true }),
  86  |   ).toBeDisabled();
  87  |   await expect(
  88  |     dialog.locator(".marketplace-connection .spinner"),
  89  |   ).toBeVisible();
  90  |   expect(searches).toBe(1);
  91  |   mode = "ready";
  92  |   release!();
> 93  |   await expect(dialog.getByRole("article")).toHaveCount(30);
      |                                             ^ Error: expect(locator).toHaveCount(expected) failed
  94  |   expect(searches).toBe(2);
  95  |   await aligned(
  96  |     dialog.getByLabel("Search for Practice dummy"),
  97  |     dialog.getByRole("button", { name: "Search again", exact: true }),
  98  |   );
  99  |   if (screenshot) await page.screenshot({ path: screenshot });
  100 |   mode = "error";
  101 |   await refresh.click();
  102 |   await expect(dialog).toContainText("Connection check failed");
  103 |   await expect(dialog.getByLabel("Asset search Studio")).toHaveValue("");
  104 |   await expect(dialog).not.toContainText("Studio connected");
  105 |   mode = "ready";
  106 |   await refresh.click();
  107 |   await expect(dialog).toContainText("Studio connected");
  108 |   expect(searches).toBe(2); // Existing choices/results are not reset by refresh.
  109 |   expect(f.errors).toEqual([]);
  110 |   return { checks, searches };
  111 | }
  112 | 
```