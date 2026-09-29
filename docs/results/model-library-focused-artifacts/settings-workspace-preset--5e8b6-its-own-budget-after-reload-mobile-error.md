# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> preset keeps ordered backups, specialist roles and its own budget after reload
- Location: tests\browser\settings-workspace.spec.ts:36:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Edit preset', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [ref=e12] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]: Workspace/Models
      - button "Back to project" [ref=e20] [cursor=pointer]
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - heading "Models" [level=1] [ref=e24]
          - paragraph [ref=e25]: Your models. Your team. Your budget.
        - button "Create preset" [ref=e26] [cursor=pointer]
      - tablist "Models workspace" [ref=e29]:
        - tab "Model library 3" [ref=e30] [cursor=pointer]:
          - text: Model library
          - generic [ref=e31]: "3"
        - tab "Presets 1" [selected] [ref=e32] [cursor=pointer]:
          - text: Presets
          - generic [ref=e33]: "1"
      - generic [ref=e35]:
        - generic [ref=e36]: Search presets
        - searchbox "Search presets" [ref=e37]
      - paragraph [ref=e38]: Save different teams for different jobs. Each preset includes its own budget.
      - article [ref=e40]:
        - generic [ref=e41]:
          - generic [aria-hidden] [ref=e42]: 🌮
          - generic [ref=e43]:
            - heading "My first preset" [level=2] [ref=e44]
            - generic [ref=e45]: Active for future work
        - generic [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]: Planner
            - generic [ref=e51]: Everyday
          - generic [ref=e55]:
            - generic [ref=e56]: Builder
            - generic [ref=e57]: Fast builder
          - generic [ref=e61]:
            - generic [ref=e62]: Reviewer
            - generic [ref=e63]: Reviewer
          - generic [ref=e67]:
            - generic [ref=e68]: Repair
            - generic [ref=e69]: Fast builder
        - generic [ref=e73]:
          - generic [ref=e74]: $2.00 / generation
          - generic [ref=e75]: $10.00 / project
        - generic [ref=e76]:
          - button "Edit My first preset" [ref=e77] [cursor=pointer]: Edit preset
          - button "In use" [disabled] [ref=e78]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { profile } from "../generation-fixtures";
  4   | test.beforeEach(async ({ request, page }) => {
  5   |   const a = { ...profile(), name: "Everyday" },
  6   |     b = { ...profile(), name: "Fast builder" },
  7   |     c = { ...profile(), name: "Reviewer" };
  8   |   await request.put("/api/models", {
  9   |     data: {
  10  |       profiles: [a, b, c],
  11  |       routes: {
  12  |         planner: [a.id],
  13  |         builder: [b.id],
  14  |         reviewer: [c.id],
  15  |         repair: [b.id],
  16  |         componentReviewer: [c.id],
  17  |       },
  18  |       budgetMicros: 10e6,
  19  |       generationBudgetMicros: 2e6,
  20  |       repairLimit: 2,
  21  |     },
  22  |   });
  23  |   await page.route("**/api/model-catalog", (r) =>
  24  |     r.fulfill({
  25  |       json: [
  26  |         {
  27  |           id: "openai/example",
  28  |           name: "Example model",
  29  |           inputRate: 0.15,
  30  |           outputRate: 0.6,
  31  |         },
  32  |       ],
  33  |     }),
  34  |   );
  35  | });
  36  | test("preset keeps ordered backups, specialist roles and its own budget after reload", async ({
  37  |   page,
  38  | }) => {
  39  |   const before = await (await page.request.get("/api/models")).json();
  40  |   await page.goto("/#presets");
> 41  |   await page.getByRole("button", { name: "Edit My first preset", exact: true }).click();
      |                                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  42  |   const dialog = page.getByRole("dialog");
  43  |   await dialog
  44  |     .locator(".preset-role")
  45  |     .filter({ has: page.getByLabel("builder primary") })
  46  |     .locator("summary")
  47  |     .click();
  48  |   await dialog
  49  |     .getByLabel("builder fallback 1")
  50  |     .selectOption(before.profiles[0].id);
  51  |   await dialog
  52  |     .getByLabel("builder fallback 2")
  53  |     .selectOption(before.profiles[2].id);
  54  |   await dialog.getByLabel("Per generation (USD)").fill(".8");
  55  |   await dialog.getByLabel("Per project (USD)").fill("5");
  56  |   await dialog.getByRole("button", { name: "Save preset" }).click();
  57  |   await expect(dialog).toBeHidden();
  58  |   const after = await (await page.request.get("/api/models")).json();
  59  |   expect(after.routes).toEqual({
  60  |     ...before.routes,
  61  |     builder: [
  62  |       before.profiles[1].id,
  63  |       before.profiles[0].id,
  64  |       before.profiles[2].id,
  65  |     ],
  66  |   });
  67  |   expect(after.generationBudgetMicros).toBe(800000);
  68  |   expect(after.budgetMicros).toBe(5e6);
  69  |   await page.reload();
  70  |   await expect(page.locator(".preset-card")).toContainText(
  71  |     "$0.80 / generation",
  72  |   );
  73  | });
  74  | test("creates a named preset and activates it without generation", async ({
  75  |   page,
  76  | }) => {
  77  |   const calls: string[] = [];
  78  |   page.on("request", (r) => {
  79  |     if (/\/api\/projects\/[^/]+\/(plan|build|repair)$/.test(r.url()))
  80  |       calls.push(r.url());
  81  |   });
  82  |   await page.goto("/#presets");
  83  |   await page.getByRole("button", { name: "Create preset" }).click();
  84  |   const dialog = page.getByRole("dialog");
  85  |   await dialog.getByLabel("Preset name").fill("Speed team");
  86  |   await dialog.getByRole("button", { name: "rocket icon" }).click();
  87  |   await dialog
  88  |     .getByLabel("Use one model for all")
  89  |     .selectOption({ label: "Fast builder" });
  90  |   await dialog.getByLabel("Per generation (USD)").fill(".5");
  91  |   await dialog.getByRole("button", { name: "Save preset" }).click();
  92  |   await expect(dialog).toBeHidden();
  93  |   expect(
  94  |     (await (await page.request.get("/api/models")).json())
  95  |       .generationBudgetMicros,
  96  |   ).toBe(2e6);
  97  |   const card = page.locator(".preset-card").filter({ hasText: "Speed team" });
  98  |   await card.getByRole("button", { name: "Use preset" }).click();
  99  |   await expect(card).toContainText("Active for future work");
  100 |   await page.reload();
  101 |   await expect(card).toContainText("🚀");
  102 |   expect(
  103 |     (await (await page.request.get("/api/models")).json())
  104 |       .generationBudgetMicros,
  105 |   ).toBe(500000);
  106 |   expect(calls).toEqual([]);
  107 | });
  108 | test("draft and one-off limit survive opening Models", async ({ page }) => {
  109 |   await page.goto("/");
  110 |   await page.getByLabel("Game idea").fill("An island with a cozy village");
  111 |   await page
  112 |     .getByRole("button", { name: "Budget for this generation" })
  113 |     .click();
  114 |   await page.getByLabel("Generation limit (USD)").fill(".75");
  115 |   await page.getByRole("button", { name: "Use limit" }).click();
  116 |   await page.getByRole("button", { name: "Presets", exact: true }).click();
  117 |   await page.goBack();
  118 |   await expect(page.getByLabel("Game idea")).toHaveValue(
  119 |     "An island with a cozy village",
  120 |   );
  121 |   await expect(
  122 |     page.getByRole("button", { name: "Budget for this generation" }),
  123 |   ).toContainText("$0.75");
  124 | });
  125 | test("unsaved preset dismissal keeps saved values", async ({ page }) => {
  126 |   await page.goto("/#presets");
  127 |   await page.getByRole("button", { name: "Edit My first preset", exact: true }).click();
  128 |   await page.getByLabel("Preset name").fill("Unsaved");
  129 |   await page.keyboard.press("Escape");
  130 |   await page.getByRole("button", { name: "Keep editing" }).click();
  131 |   await expect(page.getByLabel("Preset name")).toHaveValue("Unsaved");
  132 |   await page.keyboard.press("Escape");
  133 |   await page.getByRole("button", { name: "Discard changes" }).click();
  134 |   await expect(page.locator(".preset-card")).not.toContainText("Unsaved");
  135 | });
  136 | test("provider catalog loads automatically and persists selected models", async ({
  137 |   page,
  138 | }) => {
  139 |   await page.goto("/#models");
  140 |   await page.getByRole("button", { name: "Browse providers" }).click();
  141 |   await page
```