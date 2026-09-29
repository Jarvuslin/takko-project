# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> provider catalog loads automatically and persists selected models
- Location: tests\browser\settings-workspace.spec.ts:164:1

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
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
  - group
- main:
  - text: Workspace/Models
  - button "Back to project"
  - heading "Models" [level=1]
  - paragraph: Manage your model library and discover new models. Add models from your providers and use them in any preset.
  - button "Add model"
  - status: Saved
  - region "Saved models":
    - heading "Saved models 3" [level=2]
    - paragraph: Models you've added to your library. Use them in any preset.
    - text: Search models
    - searchbox "Search models"
    - combobox "Filter saved models by provider":
      - option "All providers" [selected]
      - option "OpenRouter"
      - option "OpenAI"
      - option "Anthropic"
      - option "Google Gemini"
      - option "Other / local"
    - article:
      - strong: Everyday
      - text: Other / local · fixture $1.00 read · $2.00 write / 1M tokens Connection Needs API key
      - button "Test connection for Everyday" [disabled]: Test
      - button "Edit Everyday": Edit
    - article:
      - strong: Fast builder
      - text: Other / local · fixture $1.00 read · $2.00 write / 1M tokens Connection Needs API key
      - button "Test connection for Fast builder" [disabled]: Test
      - button "Edit Fast builder": Edit
    - article:
      - strong: Reviewer
      - text: Other / local · fixture $1.00 read · $2.00 write / 1M tokens Connection Needs API key
      - button "Test connection for Reviewer" [disabled]: Test
      - button "Edit Reviewer": Edit
  - region "Explore providers":
    - heading "Explore providers" [level=2]
    - paragraph: One connection, every model. Choose a provider to discover what's available.
    - group "Provider":
      - button "OpenRouter" [pressed]
      - button "OpenAI"
      - button "Anthropic"
      - button "Google Gemini"
      - button "Other / local"
    - strong: OpenRouter connected
    - text: Available to all models from this provider. Saved encrypted on this PC, protected by your Windows account.
    - group: Manage connection
    - region "OpenRouter model catalog":
      - text: 1 models · choose one to add
      - button "Refresh model catalog": Refresh
      - text: Search provider models
      - searchbox "Search provider models"
      - combobox "Filter catalog by price":
        - option "All price ranges" [selected]
        - option "Free models"
        - option "Up to $1 read / $5 write"
      - combobox "Sort catalog":
        - option "Provider order" [selected]
        - 'option "Name: A–Z"'
        - 'option "Reading price: low first"'
      - button "Example model openai/example $0.15 read · $0.60 write per 1M tokens Add":
        - strong: Example model
        - text: openai/example $0.15 read · $0.60 write per 1M tokens Add
  - dialog "Add model":
    - heading "Add model" [level=2]
    - paragraph: Choose a model for your library. Use it in any preset.
    - button "Close dialog"
    - heading "Provider" [level=3]
    - group "Provider":
      - button "OpenRouter" [pressed]
      - button "OpenAI"
      - button "Anthropic"
      - button "Google Gemini"
      - button "Other / local"
    - strong: OpenRouter connected
    - text: Available to all models from this provider. Saved encrypted on this PC, protected by your Windows account.
    - group: Manage connection
    - heading "Model" [level=3]
    - strong: Example model
    - text: openai/example
    - button "Change model"
    - button "Edit model details"
    - group: Usage cost · $0.15 read / $0.60 write
    - group: Advanced Optional · defaults work for most models
    - button "Cancel"
    - button "Add to library"
```

# Test source

```ts
  73  |   await page.reload();
  74  |   await expect(page.locator(".preset-card")).toContainText(
  75  |     "$0.80 / generation",
  76  |   );
  77  | });
  78  | test("creates a named preset and activates it without generation", async ({
  79  |   page,
  80  | }) => {
  81  |   const calls: string[] = [];
  82  |   page.on("request", (r) => {
  83  |     if (/\/api\/projects\/[^/]+\/(plan|build|repair)$/.test(r.url()))
  84  |       calls.push(r.url());
  85  |   });
  86  |   await page.goto("/#presets");
  87  |   await page.getByRole("button", { name: "Create preset" }).click();
  88  |   const dialog = page.getByRole("dialog");
  89  |   await dialog.getByLabel("Preset name").fill("Speed team");
  90  |   await dialog.getByRole("button", { name: "rocket icon" }).click();
  91  |   await dialog
  92  |     .getByLabel("Use one model for all")
  93  |     .selectOption({ label: "Fast builder" });
  94  |   await dialog.getByLabel("Per generation (USD)").fill(".5");
  95  |   await dialog.getByRole("button", { name: "Save preset" }).click();
  96  |   await expect(dialog).toBeHidden();
  97  |   expect(
  98  |     (await (await page.request.get("/api/models")).json())
  99  |       .generationBudgetMicros,
  100 |   ).toBe(2e6);
  101 |   const card = page.locator(".preset-card").filter({ hasText: "Speed team" });
  102 |   await card.getByRole("button", { name: "Use preset" }).click();
  103 |   await expect(card).toContainText("Active for future work");
  104 |   await page.reload();
  105 |   await expect(card).toContainText("🚀");
  106 |   expect(
  107 |     (await (await page.request.get("/api/models")).json())
  108 |       .generationBudgetMicros,
  109 |   ).toBe(500000);
  110 |   expect(calls).toEqual([]);
  111 | });
  112 | test("draft and one-off limit survive opening Models", async ({ page }) => {
  113 |   let release!: () => void;
  114 |   let requested!: () => void;
  115 |   const gate = new Promise<void>((resolve) => {
  116 |     release = resolve;
  117 |   });
  118 |   const requestStarted = new Promise<void>((resolve) => {
  119 |     requested = resolve;
  120 |   });
  121 |   await page.route("**/api/models", async (route) => {
  122 |     const response = await route.fetch();
  123 |     requested();
  124 |     await gate;
  125 |     await route.fulfill({ response });
  126 |   });
  127 |   await page.goto("/");
  128 |   await page.getByLabel("Game idea").fill("An island with a cozy village");
  129 |   await page
  130 |     .getByRole("button", { name: "Budget for this generation" })
  131 |     .click();
  132 |   await requestStarted;
  133 |   await page.getByLabel("Generation limit (USD)").fill(".75");
  134 |   const loaded = page.waitForResponse("**/api/models");
  135 |   release();
  136 |   await loaded;
  137 |   await expect(page.getByLabel("Generation limit (USD)")).toHaveValue(".75");
  138 |   await page.getByRole("button", { name: "Use limit" }).click();
  139 |   await page
  140 |     .getByRole("navigation", { name: "Workspace" })
  141 |     .getByRole("button", { name: "Presets", exact: true })
  142 |     .click();
  143 |   await page.goBack();
  144 |   await expect(page.getByLabel("Game idea")).toHaveValue(
  145 |     "An island with a cozy village",
  146 |   );
  147 |   await expect(
  148 |     page.getByRole("button", { name: "Budget for this generation" }),
  149 |   ).toContainText("$0.75");
  150 | });
  151 | test("unsaved preset dismissal keeps saved values", async ({ page }) => {
  152 |   await page.goto("/#presets");
  153 |   await page
  154 |     .getByRole("button", { name: "Edit My first preset", exact: true })
  155 |     .click();
  156 |   await page.getByLabel("Preset name").fill("Unsaved");
  157 |   await page.keyboard.press("Escape");
  158 |   await page.getByRole("button", { name: "Keep editing" }).click();
  159 |   await expect(page.getByLabel("Preset name")).toHaveValue("Unsaved");
  160 |   await page.keyboard.press("Escape");
  161 |   await page.getByRole("button", { name: "Discard changes" }).click();
  162 |   await expect(page.locator(".preset-card")).not.toContainText("Unsaved");
  163 | });
  164 | test("provider catalog loads automatically and persists selected models", async ({
  165 |   page,
  166 | }) => {
  167 |   await page.goto("/#models");
  168 |   await connectFixture(page);
  169 |   await page
  170 |     .getByRole("button", { name: /Example model.*openai\/example/ })
  171 |     .click();
  172 |   const dialog = page.getByRole("dialog");
> 173 |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveCount(0);
      |                                                                ^ Error: expect(locator).toHaveValue(expected) failed
  174 |   await dialog.getByRole("button", { name: "Edit model details", exact: true }).click();
  175 |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  176 |     "openai/example",
  177 |   );
  178 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  179 |   await expect(dialog).toBeHidden();
  180 |   await page.reload();
  181 |   await page.getByRole("searchbox", { name: "Search models" }).fill("Example");
  182 |   await expect(page.locator(".model-row")).toHaveCount(1);
  183 |   await expect(page.locator(".model-row img")).toHaveAttribute(
  184 |     "src",
  185 |     "/brands/openai.svg",
  186 |   );
  187 |   await expect
  188 |     .poll(() =>
  189 |       page
  190 |         .locator(".model-row img")
  191 |         .evaluate((img: HTMLImageElement) => img.naturalWidth),
  192 |     )
  193 |     .toBeGreaterThan(0);
  194 | });
  195 | test("provider change clears catalog and matching credentials are reused", async ({
  196 |   page,
  197 | }) => {
  198 |   const settings = await (await page.request.get("/api/models")).json();
  199 |   await page.request.put("/api/models/" + settings.profiles[0].id + "/key", {
  200 |     data: { key: "fixture-only-key" },
  201 |   });
  202 |   await page.goto("/#models");
  203 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  204 |   const dialog = page.getByRole("dialog");
  205 |   await dialog.getByRole("button", { name: "Anthropic", exact: true }).click();
  206 |   await expect(
  207 |     dialog.getByText(
  208 |       "Connect this provider to browse its models. Your key is shared by every model you add from this provider.",
  209 |     ),
  210 |   ).toBeVisible();
  211 |   await expect(
  212 |     dialog.getByRole("button", { name: /Example model.*openai/ }),
  213 |   ).toHaveCount(0);
  214 |   await dialog
  215 |     .getByRole("button", { name: "Other / local", exact: true })
  216 |     .click();
  217 |   await dialog
  218 |     .getByLabel("Provider endpoint")
  219 |     .fill(settings.profiles[0].baseUrl);
  220 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  221 |   await expect(dialog.getByText(/A key is already available/)).toBeVisible();
  222 | });
  223 | 
  224 | test("strict concept opt-in is saved for Anthropic and cleared when switching models", async ({
  225 |   page,
  226 | }) => {
  227 |   await page.route("**/api/model-catalog", (route) =>
  228 |     route.fulfill({
  229 |       json: [
  230 |         {
  231 |           id: "anthropic/claude-haiku-4.5",
  232 |           name: "Haiku test",
  233 |           inputRate: 1,
  234 |           outputRate: 5,
  235 |         },
  236 |       ],
  237 |     }),
  238 |   );
  239 |   await page.goto("/#models");
  240 |   await connectFixture(page);
  241 |   await page
  242 |     .getByRole("button", { name: /Haiku test.*anthropic\/claude-haiku/ })
  243 |     .click();
  244 |   const dialog = page.getByRole("dialog");
  245 |   await dialog
  246 |     .locator("summary")
  247 |     .filter({ hasText: "Advanced" })
  248 |     .click();
  249 |   await dialog
  250 |     .getByLabel("Check concept response structure", { exact: true })
  251 |     .check();
  252 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  253 |   await expect(dialog).toBeHidden();
  254 |   let settings = await (await page.request.get("/api/models")).json();
  255 |   const saved = settings.profiles.find(
  256 |     (p: any) => p.model === "anthropic/claude-haiku-4.5",
  257 |   );
  258 |   expect(saved.structuredOutput).toBe("anthropic");
  259 |   await page.reload();
  260 |   await page
  261 |     .getByRole("searchbox", { name: "Search models" })
  262 |     .fill("Haiku test");
  263 |   await page
  264 |     .locator(".model-row")
  265 |     .getByRole("button", { name: /Edit/ })
  266 |     .click();
  267 |   await dialog.getByRole("button", { name: "Edit model details", exact: true }).click();
  268 |   await dialog.getByLabel("Model ID", { exact: true }).fill("openai/example");
  269 |   await dialog.getByRole("button", { name: "Save model", exact: true }).click();
  270 |   await expect(dialog).toBeHidden();
  271 |   settings = await (await page.request.get("/api/models")).json();
  272 |   expect(
  273 |     settings.profiles.find((p: any) => p.id === saved.id).structuredOutput,
```