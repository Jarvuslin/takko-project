# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> catalog search selects a model and its published rates
- Location: tests\browser\workflow.spec.ts:51:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByRole('dialog').getByLabel('Model ID', { exact: true })
Expected: "test/economy"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByRole('dialog').getByLabel('Model ID', { exact: true }) with timeout 5000ms
  - waiting for getByRole('dialog').getByLabel('Model ID', { exact: true })

```

```yaml
- complementary:
  - link "Takko home":
    - /url: /
    - text: takko
  - button "New project"
  - button "Marketplace"
- main:
  - text: Workspace/Models
  - button "Back to project"
  - heading "Models" [level=1]
  - paragraph: Your models. Your team. Your budget.
  - button "Add model"
  - tablist "Models workspace":
    - tab "Model library 0" [selected]
    - tab "Presets 1"
  - text: Search models
  - searchbox "Search models"
  - button "Browse providers"
  - text: ✦
  - heading "Your model library starts here" [level=2]
  - paragraph: Add a model from any provider, then build your team in Presets.
  - heading "Explore providers" [level=2]
  - group "Provider":
    - button "OpenRouter" [pressed]
    - button "OpenAI"
    - button "Anthropic"
    - button "Google Gemini"
    - button "Other / local"
  - region "OpenRouter model catalog":
    - strong: Available from OpenRouter
    - text: 2 models · choose one to add
    - button "Refresh model catalog": Refresh
    - text: Search provider models
    - searchbox "Search provider models"
    - button "Economy test/economy":
      - strong: Economy
      - text: test/economy
    - button "Large test/large":
      - strong: Large
      - text: test/large
  - button "Connect OpenRouter or enter a model manually"
  - dialog "Add model":
    - heading "Add model" [level=2]
    - paragraph: Choose a provider, then a model. Save it once and use it in any preset.
    - button "Close dialog"
    - heading "1. Provider" [level=3]
    - group "Provider":
      - button "OpenRouter" [pressed]
      - button "OpenAI"
      - button "Anthropic"
      - button "Google Gemini"
      - button "Other / local"
    - paragraph: Official endpoint connected automatically.
    - text: API key
    - textbox "API key The provider uses this key for your models. It stays in server memory until Takko restarts.":
      - /placeholder: Paste your provider API key
    - text: The provider uses this key for your models. It stays in server memory until Takko restarts.
    - heading "2. Model" [level=3]
    - region "OpenRouter model catalog":
      - strong: Available from OpenRouter
      - text: 2 models · choose one to add
      - button "Refresh model catalog": Refresh
      - text: Search provider models
      - searchbox "Search provider models": economy
      - button "Economy test/economy":
        - strong: Economy
        - text: test/economy
    - strong: Economy
    - text: test/economy Selected
    - button "Hide model details"
    - text: Library name
    - textbox "Library name":
      - /placeholder: A name you'll recognize
      - text: Economy
    - text: Model ID
    - textbox "Model ID Filled in when you choose from the catalog.": test/economy
    - text: Filled in when you choose from the catalog.
    - group: Usage cost · $0.10 read / $0.40 write
    - group: Fine-tune this model Optional · defaults work for most models
    - button "Cancel"
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
  17  |     dialog.getByRole("button", { name: "Cancel", exact: true }),
  18  |   ).toBeFocused();
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
  78  |   await dialog.getByLabel("Search provider models").fill("economy");
  79  |   await dialog.getByRole("button", { name: /Economy.*economy/ }).click();
> 80  |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
      |                                                                ^ Error: expect(locator).toHaveValue(expected) failed
  81  |     "test/economy",
  82  |   );
  83  |   await expect(dialog.getByLabel("Reading price")).toHaveValue("0.1");
  84  |   await expect(dialog.getByLabel("Writing price")).toHaveValue("0.4");
  85  |   expect(
  86  |     (await (await page.request.get("/api/models")).json()).profiles,
  87  |   ).toHaveLength(0);
  88  |   await dialog.getByRole("button", { name: "Add to library" }).click();
  89  |   await expect(dialog).toBeHidden();
  90  |   const saved = await (await page.request.get("/api/models")).json();
  91  |   expect(saved.profiles[0].model).toBe("test/economy");
  92  |   await page.request.delete("/api/model-profiles/" + saved.profiles[0].id);
  93  | });
  94  | 
  95  | test("welcomes multiple game ideas without generating a preset or claiming a connection", async ({
  96  |   page,
  97  | }, testInfo) => {
  98  |   await page.goto("/");
  99  |   await expect(
  100 |     page.getByRole("heading", { name: "What do you want to build?" }),
  101 |   ).toBeVisible();
  102 |   await page
  103 |     .getByLabel("Game idea")
  104 |     .fill(
  105 |       "Make a farming loop with crop growth, harvesting, selling and a shop",
  106 |     );
  107 |   await expect(page.getByLabel("Game idea")).toHaveValue(/farming/);
  108 |   await page.getByRole("button", { name: "Create project" }).click();
  109 |   await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
  110 |   await page.getByRole("button", { name: "Plan this game" }).click();
  111 |   await expect(page.getByRole("alert")).toContainText("Configure");
  112 |   await page.getByRole("tab", { name: "Studio", exact: true }).click();
  113 |   await expect(page.getByText("Awaiting connection")).toBeVisible();
  114 |   await expect(
  115 |     page.getByRole("link", { name: "Download Takko.rbxmx" }),
  116 |   ).toHaveAttribute("href", "/api/studio/plugin");
  117 |   await page.screenshot({
  118 |     path: `docs/results/forge-v2-studio-${testInfo.project.name}.png`,
  119 |     fullPage: true,
  120 |   });
  121 | });
  122 | test("configures provider keys without reflecting secrets or persisting them in browser storage", async ({
  123 |   page,
  124 | }) => {
  125 |   await page.request.put("/api/models", {
  126 |     data: {
  127 |       profiles: [],
  128 |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  129 |       budgetMicros: 2e6,
  130 |       repairLimit: 1,
  131 |     },
  132 |   });
  133 |   await page.goto("/#models");
  134 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  135 |   const dialog = page.getByRole("dialog");
  136 |   await dialog
  137 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  138 |     .click();
  139 |   await dialog.getByLabel("Library name").fill("My model");
  140 |   await dialog.getByLabel("Model ID", { exact: true }).fill("test/model");
  141 |   await dialog
  142 |     .getByLabel("API key", { exact: true })
  143 |     .fill("browser-test-secret");
  144 |   await dialog.getByLabel("Reading price").fill("0.1");
  145 |   await dialog.getByLabel("Writing price").fill("0.2");
  146 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  147 |   await expect(dialog).toBeHidden();
  148 |   await page
  149 |     .getByRole("button", { name: "Edit My model", exact: true })
  150 |     .click();
  151 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  152 |   const settings = await (await page.request.get("/api/models")).text();
  153 |   expect(settings).not.toContain("browser-test-secret");
  154 |   expect(
  155 |     await page.evaluate(
  156 |       () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
  157 |     ),
  158 |   ).not.toContain("browser-test-secret");
  159 |   await dialog
  160 |     .getByRole("button", { name: "Remove model", exact: true })
  161 |     .click();
  162 |   await dialog.getByRole("button", { name: "Remove from library" }).click();
  163 |   await expect(dialog).toBeHidden();
  164 | });
  165 | 
  166 | test("keeps the model editor open when saving fails", async ({ page }) => {
  167 |   await page.goto("/#models");
  168 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  169 |   await page.route("**/api/model-profiles/*", (r) =>
  170 |     r.fulfill({
  171 |       status: 400,
  172 |       json: { error: "Unable to save model settings" },
  173 |     }),
  174 |   );
  175 |   const dialog = page.getByRole("dialog");
  176 |   await dialog
  177 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  178 |     .click();
  179 |   await dialog.getByLabel("Model ID", { exact: true }).fill("sample/model");
  180 |   await dialog.getByRole("button", { name: "Add to library" }).click();
```