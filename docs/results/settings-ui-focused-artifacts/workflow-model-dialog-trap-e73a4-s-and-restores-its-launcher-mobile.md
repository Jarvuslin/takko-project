# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> model dialog traps keyboard focus and restores its launcher
- Location: tests\browser\workflow.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('dialog').getByRole('button', { name: 'Add to library' })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" getByRole('dialog').getByRole('button', { name: 'Add to library' }) with timeout 5000ms
  - waiting for getByRole('dialog').getByRole('button', { name: 'Add to library' })
    14 × locator resolved to <button class="primary">Add to library</button>
       - unexpected value "inactive"

```

```yaml
- button "Add to library"
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { createServer } from "node:http";
  4   | import { fakeTransport, profile } from "../generation-fixtures";
  5   | 
  6   | test("model dialog traps keyboard focus and restores its launcher", async ({
  7   |   page,
  8   | }) => {
  9   |   await page.goto("/#models");
  10  |   const launcher = page.getByRole("button", { name: "Add model", exact: true });
  11  |   await launcher.click();
  12  |   const dialog = page.getByRole("dialog");
  13  |   const close = dialog.getByRole("button", { name: "Close dialog" });
  14  |   await expect(close).toBeFocused();
  15  |   await close.press("Shift+Tab");
  16  |   await expect(
  17  |     dialog.getByRole("button", { name: "Add to library" }),
> 18  |   ).toBeFocused();
      |     ^ Error: expect(locator).toBeFocused() failed
  19  |   await page.keyboard.press("Tab");
  20  |   await expect(close).toBeFocused();
  21  |   await page.keyboard.press("Escape");
  22  |   await expect(dialog).toBeHidden();
  23  |   await expect(launcher).toBeFocused();
  24  | });
  25  | 
  26  | test("project selection survives refresh and tabs support arrow keys", async ({
  27  |   page,
  28  | }, testInfo) => {
  29  |   await page.goto("/");
  30  |   await page.getByLabel("Game idea").fill("A small puzzle game");
  31  |   await page.getByRole("button", { name: "Create project" }).click();
  32  |   await expect(page).toHaveURL(/project=/);
  33  |   await page.reload();
  34  |   await expect(page.getByLabel("Project request")).toHaveValue(
  35  |     "A small puzzle game",
  36  |   );
  37  |   if (testInfo.project.name === "mobile")
  38  |     await expect(page.getByLabel("Open project")).toBeVisible();
  39  |   const brief = page.getByRole("tab", { name: "Brief", exact: true });
  40  |   await brief.focus();
  41  |   await brief.press("ArrowRight");
  42  |   await expect(
  43  |     page.getByRole("tab", { name: "Build", exact: true }),
  44  |   ).toBeFocused();
  45  |   await page.keyboard.press("End");
  46  |   await expect(
  47  |     page.getByRole("tab", { name: "Studio", exact: true }),
  48  |   ).toHaveAttribute("aria-selected", "true");
  49  | });
  50  | 
  51  | test("catalog search selects a model and its published rates", async ({
  52  |   page,
  53  | }) => {
  54  |   await page.request.put("/api/models", {
  55  |     data: {
  56  |       profiles: [],
  57  |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  58  |       budgetMicros: 250000,
  59  |       repairLimit: 1,
  60  |     },
  61  |   });
  62  |   await page.route("**/api/model-catalog", (r) =>
  63  |     r.fulfill({
  64  |       json: [
  65  |         {
  66  |           id: "test/economy",
  67  |           name: "Economy",
  68  |           inputRate: 0.1,
  69  |           outputRate: 0.4,
  70  |         },
  71  |         { id: "test/large", name: "Large", inputRate: 5, outputRate: 15 },
  72  |       ],
  73  |     }),
  74  |   );
  75  |   await page.goto("/#models");
  76  |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  77  |   const dialog = page.getByRole("dialog");
  78  |   await dialog.getByRole("button", { name: "Fetch catalog" }).click();
  79  |   await dialog.getByLabel("Search available models").fill("economy");
  80  |   await dialog.getByRole("button", { name: /Economy.*economy/ }).click();
  81  |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  82  |     "test/economy",
  83  |   );
  84  |   await expect(dialog.getByLabel("Input USD")).toHaveValue("0.1");
  85  |   await expect(dialog.getByLabel("Output USD")).toHaveValue("0.4");
  86  |   expect(
  87  |     (await (await page.request.get("/api/models")).json()).profiles,
  88  |   ).toHaveLength(0);
  89  |   await dialog.getByRole("button", { name: "Add to library" }).click();
  90  |   await expect(dialog).toBeHidden();
  91  |   const saved = await (await page.request.get("/api/models")).json();
  92  |   expect(saved.profiles[0].model).toBe("test/economy");
  93  |   await page.request.delete("/api/model-profiles/" + saved.profiles[0].id);
  94  | });
  95  | 
  96  | test("welcomes multiple game ideas without generating a preset or claiming a connection", async ({
  97  |   page,
  98  | }, testInfo) => {
  99  |   await page.goto("/");
  100 |   await expect(
  101 |     page.getByRole("heading", { name: "What do you want to build?" }),
  102 |   ).toBeVisible();
  103 |   await page
  104 |     .getByLabel("Game idea")
  105 |     .fill(
  106 |       "Make a farming loop with crop growth, harvesting, selling and a shop",
  107 |     );
  108 |   await expect(page.getByLabel("Game idea")).toHaveValue(/farming/);
  109 |   await page.getByRole("button", { name: "Create project" }).click();
  110 |   await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
  111 |   await page.getByRole("button", { name: "Plan this game" }).click();
  112 |   await expect(page.getByRole("alert")).toContainText("Configure");
  113 |   await page.getByRole("tab", { name: "Studio", exact: true }).click();
  114 |   await expect(page.getByText("Awaiting connection")).toBeVisible();
  115 |   await expect(
  116 |     page.getByRole("link", { name: "Download Takko.rbxmx" }),
  117 |   ).toHaveAttribute("href", "/api/studio/plugin");
  118 |   await page.screenshot({
```