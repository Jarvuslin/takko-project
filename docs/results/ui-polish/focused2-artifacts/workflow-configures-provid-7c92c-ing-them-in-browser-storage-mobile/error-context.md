# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> configures provider keys without reflecting secrets or persisting them in browser storage
- Location: tests\browser\workflow.spec.ts:132:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog').getByText(/No need to enter the key again/)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog').getByText(/No need to enter the key again/) with timeout 5000ms
  - waiting for getByRole('dialog').getByText(/No need to enter the key again/)

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
    - heading "Saved models 1" [level=2]
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
      - strong: My model
      - text: OpenRouter · test/model $0.10 read · $0.20 write / 1M tokens Connection ● Connected
      - button "Test connection for My model" [disabled]: Test
      - button "Edit My model": Edit
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
      - text: The catalog loads automatically
      - button "Refresh model catalog": Refresh
      - status: Couldn't load models. Check your key and connection, or enter a model ID manually.
  - dialog "Edit model":
    - heading "Edit model" [level=2]
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
    - strong: My model
    - text: test/model
    - button "Change model"
    - button "Edit model details"
    - group: Usage cost · $0.10 read / $0.20 write
    - group: Advanced Optional · defaults work for most models
    - button "Remove model"
    - button "Cancel"
    - button "Save model"
```

# Test source

```ts
  62  |     data: {
  63  |       profiles: [],
  64  |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  65  |       budgetMicros: 250000,
  66  |       repairLimit: 1,
  67  |     },
  68  |   });
  69  |   await page.route("**/api/model-catalog", (r) =>
  70  |     r.fulfill({
  71  |       json: [
  72  |         {
  73  |           id: "test/economy",
  74  |           name: "Economy",
  75  |           inputRate: 0.1,
  76  |           outputRate: 0.4,
  77  |         },
  78  |         { id: "test/large", name: "Large", inputRate: 5, outputRate: 15 },
  79  |       ],
  80  |     }),
  81  |   );
  82  |   await page.goto("/#models");
  83  |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  84  |   const dialog = page.getByRole("dialog");
  85  |   await connectFixture(page, true);
  86  |   await dialog.getByLabel("Search provider models").fill("economy");
  87  |   await dialog.getByRole("button", { name: /Economy.*economy/ }).click();
  88  |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveCount(0);
  89  |   await dialog
  90  |     .getByRole("button", { name: "Edit model details", exact: true })
  91  |     .click();
  92  |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  93  |     "test/economy",
  94  |   );
  95  |   await expect(dialog.getByLabel("Reading price")).toHaveValue("0.1");
  96  |   await expect(dialog.getByLabel("Writing price")).toHaveValue("0.4");
  97  |   expect(
  98  |     (await (await page.request.get("/api/models")).json()).profiles,
  99  |   ).toHaveLength(0);
  100 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  101 |   await expect(dialog).toBeHidden();
  102 |   const saved = await (await page.request.get("/api/models")).json();
  103 |   expect(saved.profiles[0].model).toBe("test/economy");
  104 |   await page.request.delete("/api/model-profiles/" + saved.profiles[0].id);
  105 | });
  106 | 
  107 | test("welcomes multiple game ideas without generating a preset or claiming a connection", async ({
  108 |   page,
  109 | }, testInfo) => {
  110 |   await page.goto("/");
  111 |   await expect(
  112 |     page.getByRole("heading", { name: "What do you want to build?" }),
  113 |   ).toBeVisible();
  114 |   await page
  115 |     .getByLabel("Game idea")
  116 |     .fill(
  117 |       "Make a farming loop with crop growth, harvesting, selling and a shop",
  118 |     );
  119 |   await expect(page.getByLabel("Game idea")).toHaveValue(/farming/);
  120 |   await page.getByRole("button", { name: "Create project" }).click();
  121 |   await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
  122 |   await page.getByRole("button", { name: "Plan this game" }).click();
  123 |   await expect(page.getByRole("alert")).toContainText("Configure");
  124 |   await page
  125 |     .getByRole("button", { name: "Studio details", exact: true })
  126 |     .click();
  127 |   await expect(page.getByText("Awaiting connection")).toBeVisible();
  128 |   await expect(
  129 |     page.getByRole("link", { name: "Download Takko.rbxmx" }),
  130 |   ).toHaveAttribute("href", "/api/studio/plugin");
  131 |   await page.screenshot({
  132 |     path: `docs/results/forge-v2-studio-${testInfo.project.name}.png`,
  133 |     fullPage: true,
  134 |   });
  135 | });
  136 | test("configures provider keys without reflecting secrets or persisting them in browser storage", async ({
  137 |   page,
  138 | }) => {
  139 |   await page.request.put("/api/models", {
  140 |     data: {
  141 |       profiles: [],
  142 |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  143 |       budgetMicros: 2e6,
  144 |       repairLimit: 1,
  145 |     },
  146 |   });
  147 |   await page.goto("/#models");
  148 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  149 |   const dialog = page.getByRole("dialog");
  150 |   await connectFixture(page, true);
  151 |   await dialog
  152 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  153 |     .click();
  154 |   await dialog.getByLabel("Library name").fill("My model");
  155 |   await dialog.getByLabel("Model ID", { exact: true }).fill("test/model");
  156 | 
  157 |   await dialog.getByLabel("Reading price").fill("0.1");
  158 |   await dialog.getByLabel("Writing price").fill("0.2");
  159 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  160 |   await expect(dialog).toBeHidden();
  161 |   await page
> 162 |     .getByRole("button", { name: "Edit My model", exact: true })
      |     ^ Error: expect(locator).toBeVisible() failed
  163 |     .click();
  164 |   await expect(
  165 |     dialog.getByText(/Available to all models from this provider/),
  166 |   ).toBeVisible();
  167 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveCount(0);
  168 |   const settings = await (await page.request.get("/api/models")).text();
  169 |   expect(settings).not.toContain("browser-test-secret");
  170 |   expect(
  171 |     await page.evaluate(
  172 |       () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
  173 |     ),
  174 |   ).not.toContain("browser-test-secret");
  175 |   await dialog
  176 |     .getByRole("button", { name: "Remove model", exact: true })
  177 |     .click();
  178 |   await dialog.getByRole("button", { name: "Remove from library" }).click();
  179 |   await expect(dialog).toBeHidden();
  180 | });
  181 | 
  182 | test("keeps the model editor open when saving fails", async ({ page }) => {
  183 |   await page.goto("/#models");
  184 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  185 |   await page.route("**/api/model-profiles/*", (r) =>
  186 |     r.fulfill({
  187 |       status: 400,
  188 |       json: { error: "Unable to save model settings" },
  189 |     }),
  190 |   );
  191 |   const dialog = page.getByRole("dialog");
  192 |   await connectFixture(page, true);
  193 |   await dialog
  194 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  195 |     .click();
  196 |   await dialog.getByLabel("Model ID", { exact: true }).fill("sample/model");
  197 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  198 |   await expect(dialog).toBeVisible();
  199 |   await expect(dialog.getByRole("alert")).toContainText(
  200 |     "Unable to save model settings",
  201 |   );
  202 | });
  203 | 
  204 | test("welcome and model settings pass accessibility checks and fit the viewport", async ({
  205 |   page,
  206 | }, testInfo) => {
  207 |   await page.goto("/");
  208 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  209 |   expect(
  210 |     await page.evaluate(
  211 |       () => document.documentElement.scrollWidth <= innerWidth,
  212 |     ),
  213 |   ).toBe(true);
  214 |   await page.screenshot({
  215 |     path: `docs/results/forge-v2-welcome-${testInfo.project.name}.png`,
  216 |     fullPage: true,
  217 |   });
  218 |   await page
  219 |     .locator(".topbar")
  220 |     .getByRole("button", { name: "Models", exact: true })
  221 |     .click();
  222 |   expect(
  223 |     (await new AxeBuilder({ page }).include(".settings-workspace").analyze())
  224 |       .violations,
  225 |   ).toEqual([]);
  226 | });
  227 | test("builds an approved non-combat project through a real HTTP provider adapter", async ({
  228 |   page,
  229 | }, testInfo) => {
  230 |   const transport = fakeTransport({ question: true });
  231 |   const server = createServer(async (req, res) => {
  232 |     let body = "";
  233 |     for await (const chunk of req) body += chunk;
  234 |     const response = await transport("http://fixture", {
  235 |       method: "POST",
  236 |       body,
  237 |     });
  238 |     res.writeHead(200, { "Content-Type": "application/json" });
  239 |     res.end(await response.text());
  240 |   });
  241 |   await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  242 |   const model = {
  243 |     ...profile(),
  244 |     baseUrl:
  245 |       "http://127.0.0.1:" + (server.address() as { port: number }).port + "/v1",
  246 |   };
  247 |   try {
  248 |     await page.request.put("/api/models", {
  249 |       data: {
  250 |         profiles: [model],
  251 |         routes: {
  252 |           planner: [model.id],
  253 |           builder: [model.id],
  254 |           reviewer: [model.id],
  255 |           repair: [model.id],
  256 |         },
  257 |         budgetMicros: 2e6,
  258 |         repairLimit: 1,
  259 |       },
  260 |     });
  261 |     await page.goto("/");
  262 |     await page.getByLabel("Game idea").fill("Build a farming game");
```