# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> provider catalog loads automatically and persists selected models
- Location: tests\browser\settings-workspace.spec.ts:136:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByRole('dialog').getByLabel('Model ID', { exact: true })
Expected: "openai/example"
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
    - tab "Model library 3" [selected]
    - tab "Presets 1"
  - text: Search models
  - searchbox "Search models"
  - button "Browse providers" [expanded]
  - article:
    - strong: Everyday
    - text: Other / local · fixture Needs API key
    - button "Edit Everyday": Edit
  - article:
    - strong: Fast builder
    - text: Other / local · fixture Needs API key
    - button "Edit Fast builder": Edit
  - article:
    - strong: Reviewer
    - text: Other / local · fixture Needs API key
    - button "Edit Reviewer": Edit
  - heading "Explore providers" [level=2]
  - group "Provider":
    - button "OpenRouter" [pressed]
    - button "OpenAI"
    - button "Anthropic"
    - button "Google Gemini"
    - button "Other / local"
  - region "OpenRouter model catalog":
    - strong: Available from OpenRouter
    - text: 1 models · choose one to add
    - button "Refresh model catalog": Refresh
    - text: Search provider models
    - searchbox "Search provider models"
    - button "Example model openai/example":
      - strong: Example model
      - text: openai/example
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
      - text: 1 models · choose one to add
      - button "Refresh model catalog": Refresh
      - text: Search provider models
      - searchbox "Search provider models"
      - button "Example model openai/example":
        - strong: Example model
        - text: openai/example
    - strong: Example model
    - text: openai/example Selected
    - button "Hide model details"
    - text: Library name
    - textbox "Library name":
      - /placeholder: A name you'll recognize
      - text: Example model
    - text: Model ID
    - textbox "Model ID Filled in when you choose from the catalog.": openai/example
    - text: Filled in when you choose from the catalog.
    - group: Usage cost · $0.15 read / $0.60 write
    - group: Fine-tune this model Optional · defaults work for most models
    - button "Cancel"
    - button "Add to library"
```

# Test source

```ts
  45  |   await dialog
  46  |     .locator(".preset-role")
  47  |     .filter({ has: page.getByLabel("builder primary") })
  48  |     .locator("summary")
  49  |     .click();
  50  |   await dialog
  51  |     .getByLabel("builder fallback 1")
  52  |     .selectOption(before.profiles[0].id);
  53  |   await dialog
  54  |     .getByLabel("builder fallback 2")
  55  |     .selectOption(before.profiles[2].id);
  56  |   await dialog.getByLabel("Per generation (USD)").fill(".8");
  57  |   await dialog.getByLabel("Per project (USD)").fill("5");
  58  |   await dialog.getByRole("button", { name: "Save preset" }).click();
  59  |   await expect(dialog).toBeHidden();
  60  |   const after = await (await page.request.get("/api/models")).json();
  61  |   expect(after.routes).toEqual({
  62  |     ...before.routes,
  63  |     builder: [
  64  |       before.profiles[1].id,
  65  |       before.profiles[0].id,
  66  |       before.profiles[2].id,
  67  |     ],
  68  |   });
  69  |   expect(after.generationBudgetMicros).toBe(800000);
  70  |   expect(after.budgetMicros).toBe(5e6);
  71  |   await page.reload();
  72  |   await expect(page.locator(".preset-card")).toContainText(
  73  |     "$0.80 / generation",
  74  |   );
  75  | });
  76  | test("creates a named preset and activates it without generation", async ({
  77  |   page,
  78  | }) => {
  79  |   const calls: string[] = [];
  80  |   page.on("request", (r) => {
  81  |     if (/\/api\/projects\/[^/]+\/(plan|build|repair)$/.test(r.url()))
  82  |       calls.push(r.url());
  83  |   });
  84  |   await page.goto("/#presets");
  85  |   await page.getByRole("button", { name: "Create preset" }).click();
  86  |   const dialog = page.getByRole("dialog");
  87  |   await dialog.getByLabel("Preset name").fill("Speed team");
  88  |   await dialog.getByRole("button", { name: "rocket icon" }).click();
  89  |   await dialog
  90  |     .getByLabel("Use one model for all")
  91  |     .selectOption({ label: "Fast builder" });
  92  |   await dialog.getByLabel("Per generation (USD)").fill(".5");
  93  |   await dialog.getByRole("button", { name: "Save preset" }).click();
  94  |   await expect(dialog).toBeHidden();
  95  |   expect(
  96  |     (await (await page.request.get("/api/models")).json())
  97  |       .generationBudgetMicros,
  98  |   ).toBe(2e6);
  99  |   const card = page.locator(".preset-card").filter({ hasText: "Speed team" });
  100 |   await card.getByRole("button", { name: "Use preset" }).click();
  101 |   await expect(card).toContainText("Active for future work");
  102 |   await page.reload();
  103 |   await expect(card).toContainText("🚀");
  104 |   expect(
  105 |     (await (await page.request.get("/api/models")).json())
  106 |       .generationBudgetMicros,
  107 |   ).toBe(500000);
  108 |   expect(calls).toEqual([]);
  109 | });
  110 | test("draft and one-off limit survive opening Models", async ({ page }) => {
  111 |   await page.goto("/");
  112 |   await page.getByLabel("Game idea").fill("An island with a cozy village");
  113 |   await page
  114 |     .getByRole("button", { name: "Budget for this generation" })
  115 |     .click();
  116 |   await page.getByLabel("Generation limit (USD)").fill(".75");
  117 |   await page.getByRole("button", { name: "Use limit" }).click();
  118 |   await page.getByRole("button", { name: "Presets", exact: true }).click();
  119 |   await page.goBack();
  120 |   await expect(page.getByLabel("Game idea")).toHaveValue(
  121 |     "An island with a cozy village",
  122 |   );
  123 |   await expect(
  124 |     page.getByRole("button", { name: "Budget for this generation" }),
  125 |   ).toContainText("$0.75");
  126 | });
  127 | test("unsaved preset dismissal keeps saved values", async ({ page }) => {
  128 |   await page.goto("/#presets");
  129 |   await page
  130 |     .getByRole("button", { name: "Edit My first preset", exact: true })
  131 |     .click();
  132 |   await page.getByLabel("Preset name").fill("Unsaved");
  133 |   await page.keyboard.press("Escape");
  134 |   await page.getByRole("button", { name: "Keep editing" }).click();
  135 |   await expect(page.getByLabel("Preset name")).toHaveValue("Unsaved");
  136 |   await page.keyboard.press("Escape");
  137 |   await page.getByRole("button", { name: "Discard changes" }).click();
  138 |   await expect(page.locator(".preset-card")).not.toContainText("Unsaved");
  139 | });
  140 | test("provider catalog loads automatically and persists selected models", async ({
  141 |   page,
  142 | }) => {
  143 |   await page.goto("/#models");
  144 |   await page.getByRole("button", { name: "Browse providers" }).click();
> 145 |   await page
      |                                                                ^ Error: expect(locator).toHaveValue(expected) failed
  146 |     .getByRole("button", { name: /Example model.*openai\/example/ })
  147 |     .click();
  148 |   const dialog = page.getByRole("dialog");
  149 |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  150 |     "openai/example",
  151 |   );
  152 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  153 |   await expect(dialog).toBeHidden();
  154 |   await page.reload();
  155 |   await page.getByRole("searchbox", { name: "Search models" }).fill("Example");
  156 |   await expect(page.locator(".model-row")).toHaveCount(1);
  157 |   await expect(page.locator(".model-row img")).toHaveAttribute(
  158 |     "src",
  159 |     "/brands/openai.svg",
  160 |   );
  161 |   await expect
  162 |     .poll(() =>
  163 |       page
  164 |         .locator(".model-row img")
  165 |         .evaluate((img: HTMLImageElement) => img.naturalWidth),
  166 |     )
  167 |     .toBeGreaterThan(0);
  168 | });
  169 | test("provider change clears catalog and matching credentials are reused", async ({
  170 |   page,
  171 | }) => {
  172 |   const settings = await (await page.request.get("/api/models")).json();
  173 |   await page.request.put("/api/models/" + settings.profiles[0].id + "/key", {
  174 |     data: { key: "fixture-only-key" },
  175 |   });
  176 |   await page.goto("/#models");
  177 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  178 |   const dialog = page.getByRole("dialog");
  179 |   await dialog.getByRole("button", { name: "Anthropic", exact: true }).click();
  180 |   await expect(
  181 |     dialog.getByText(
  182 |       "Enter your provider API key to load its available models.",
  183 |     ),
  184 |   ).toBeVisible();
  185 |   await expect(
  186 |     dialog.getByRole("button", { name: /Example model.*openai/ }),
  187 |   ).toHaveCount(0);
  188 |   await dialog
  189 |     .getByRole("button", { name: "Other / local", exact: true })
  190 |     .click();
  191 |   await dialog
  192 |     .getByLabel("Provider endpoint")
  193 |     .fill(settings.profiles[0].baseUrl);
  194 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  195 |   await expect(
  196 |     dialog.getByText(/No need to enter the key again/),
  197 |   ).toBeVisible();
  198 | });
  199 | test("Models tabs and dialogs pass accessibility and keep actions visible", async ({
  200 |   page,
  201 | }, info) => {
  202 |   for (const route of ["models", "presets"]) {
  203 |     await page.goto("/#" + route);
  204 |     await expect(
  205 |       page.getByRole("heading", { name: "Models", exact: true }),
  206 |     ).toBeVisible();
  207 |     expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  208 |     expect(
  209 |       await page.evaluate(
  210 |         () => document.documentElement.scrollWidth <= innerWidth,
  211 |       ),
  212 |     ).toBe(true);
  213 |     await page.screenshot({
  214 |       path: `docs/results/model-library-${route}-${info.project.name}.png`,
  215 |       fullPage: true,
  216 |     });
  217 |     await page
  218 |       .getByRole("button", {
  219 |         name: route === "models" ? "Add model" : "Create preset",
  220 |         exact: true,
  221 |       })
  222 |       .click();
  223 |     const dialog = page.getByRole("dialog");
  224 |     expect(
  225 |       (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  226 |     ).toEqual([]);
  227 |     const box = await dialog
  228 |       .getByRole("button", {
  229 |         name: route === "models" ? "Add to library" : "Save preset",
  230 |       })
  231 |       .boundingBox();
  232 |     expect(box!.y + box!.height).toBeLessThanOrEqual(
  233 |       page.viewportSize()!.height,
  234 |     );
  235 |     await page.screenshot({
  236 |       path: `docs/results/model-library-${route}-dialog-${info.project.name}.png`,
  237 |     });
  238 |     await page.keyboard.press("Escape");
  239 |   }
  240 | });
  241 | test("project-specific preset route survives refresh", async ({ page }) => {
  242 |   const p = await (
  243 |     await page.request.post("/api/projects", {
  244 |       data: { request: "A castle puzzle adventure" },
  245 |     })
```