# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> provider catalog loads automatically and persists selected models
- Location: tests\browser\settings-workspace.spec.ts:164:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.model-row')
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('.model-row') with timeout 5000ms
  - waiting for locator('.model-row')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - link "Takko home" [ref=f1e5] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e8]: takko
    - button "New project" [ref=f1e9] [cursor=pointer]
    - button "Marketplace" [ref=f1e13] [cursor=pointer]
    - navigation "Workspace" [ref=f1e17]:
      - button "Models" [ref=f1e18] [cursor=pointer]
      - button "Presets" [ref=f1e22] [cursor=pointer]
    - group [ref=f1e26]:
      - generic [ref=f1e27]:
        - generic [ref=f1e28]:
          - generic [ref=f1e29]: Search projects
          - searchbox "Search projects" [ref=f1e30]
        - generic [ref=f1e31]:
          - text: Recent projects
          - generic [ref=f1e32]: "691"
        - navigation "Projects" [ref=f1e33]:
          - button "A punch animation preview" [ref=f1e34] [cursor=pointer]
          - button "A cooperative garden game" [ref=f1e36] [cursor=pointer]
          - button "A combat game with energy" [ref=f1e38] [cursor=pointer]
          - button "Orchard" [ref=f1e40] [cursor=pointer]
          - button "Make a farming loop with crop growth, harvesting, selling and a" [ref=f1e42] [cursor=pointer]
          - button "A small puzzle game" [ref=f1e44] [cursor=pointer]
          - button "A cooperative farming game with a harvest shop" [ref=f1e46] [cursor=pointer]
          - button "A Studio recovery fixture" [ref=f1e48] [cursor=pointer]
          - button "A castle puzzle adventure" [ref=f1e50] [cursor=pointer]
          - button "A polling fixture game" [ref=f1e52] [cursor=pointer]
          - button "Build a butter game" [ref=f1e54] [cursor=pointer]
          - button "Animation pack preview test" [ref=f1e56] [cursor=pointer]
          - button "A cooperative farming game" [ref=f1e58] [cursor=pointer]
          - button "A farming game with a harvest shop" [ref=f1e60] [cursor=pointer]
          - button "Build a cookie scene" [ref=f1e62] [cursor=pointer]
          - button "A Steal a Brainrot style game" [ref=f1e64] [cursor=pointer]
          - button "Animation accessibility test" [ref=f1e66] [cursor=pointer]
          - button "A combat game" [ref=f1e68] [cursor=pointer]
          - button "A combat game" [ref=f1e70] [cursor=pointer]
          - button "An arena with short rounds" [ref=f1e72] [cursor=pointer]
          - button "A garden for friends to explore" [ref=f1e74] [cursor=pointer]
          - button "Make a game about a space station" [ref=f1e76] [cursor=pointer]
          - button "Make a pet rescue game" [ref=f1e78] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=f1e80] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=f1e82] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=f1e84] [cursor=pointer]
          - button "B icon rail 911eaf10-0a0e-4084-8d41-142663a737f0" [ref=f1e86] [cursor=pointer]
          - button "Arena architecture dock regression" [ref=f1e88] [cursor=pointer]
          - button "Asset execution UI regression" [ref=f1e90] [cursor=pointer]
          - button "A punch animation preview" [ref=f1e92] [cursor=pointer]
          - button "A cooperative garden game" [ref=f1e94] [cursor=pointer]
          - button "A combat game with energy" [ref=f1e96] [cursor=pointer]
          - button "Orchard" [ref=f1e98] [cursor=pointer]
          - button "Make a farming loop with crop growth, harvesting, selling and a" [ref=f1e100] [cursor=pointer]
          - button "A small puzzle game" [ref=f1e102] [cursor=pointer]
          - button "A cooperative farming game with a harvest shop" [ref=f1e104] [cursor=pointer]
          - button "A Studio recovery fixture" [ref=f1e106] [cursor=pointer]
          - button "A castle puzzle adventure" [ref=f1e108] [cursor=pointer]
          - button "A polling fixture game" [ref=f1e110] [cursor=pointer]
          - button "Build a butter game" [ref=f1e112] [cursor=pointer]
          - button "Animation pack preview test" [ref=f1e114] [cursor=pointer]
          - button "A cooperative farming game" [ref=f1e116] [cursor=pointer]
          - button "A farming game with a harvest shop" [ref=f1e118] [cursor=pointer]
          - button "Build a cookie scene" [ref=f1e120] [cursor=pointer]
          - button "A Steal a Brainrot style game" [ref=f1e122] [cursor=pointer]
          - button "Animation accessibility test" [ref=f1e124] [cursor=pointer]
          - button "A combat game" [ref=f1e126] [cursor=pointer]
          - button "A combat game" [ref=f1e128] [cursor=pointer]
          - button "An arena with short rounds" [ref=f1e130] [cursor=pointer]
          - button "A garden for friends to explore" [ref=f1e132] [cursor=pointer]
          - button "Make a game about a space station" [ref=f1e134] [cursor=pointer]
          - button "Make a pet rescue game" [ref=f1e136] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=f1e138] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=f1e140] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=f1e142] [cursor=pointer]
          - button "B icon rail 70aaf97a-b73c-4dda-b24e-fe8f70b8e231" [ref=f1e144] [cursor=pointer]
          - button "Arena architecture dock regression" [ref=f1e146] [cursor=pointer]
          - button "Asset execution UI regression" [ref=f1e148] [cursor=pointer]
          - button "A punch animation preview" [ref=f1e150] [cursor=pointer]
          - button "A cooperative garden game" [ref=f1e152] [cursor=pointer]
          - button "Show more projects" [ref=f1e154] [cursor=pointer]
    - generic [ref=f1e155]:
      - link "Download plugin" [ref=f1e156] [cursor=pointer]:
        - /url: /api/studio/plugin
      - generic [ref=f1e162]: Local workspace
  - main [ref=f1e164]:
    - generic [ref=f1e165]:
      - generic [ref=f1e166]: Workspace/Models
      - generic [ref=f1e167]:
        - generic "Create or open a project to set up Studio" [ref=f1e168]: Studio not connected
        - button "Back to project" [ref=f1e170] [cursor=pointer]
    - generic [ref=f1e171]:
      - generic [ref=f1e172]:
        - generic [ref=f1e173]:
          - heading "Models" [level=1] [ref=f1e174]
          - paragraph [ref=f1e175]: Manage your model library and discover new models. Add models from your providers and use them in any preset.
        - button "Add model" [ref=f1e176] [cursor=pointer]
      - region "Saved models" [ref=f1e179]:
        - generic [ref=f1e180]:
          - heading "Saved models 3" [level=2] [ref=f1e181]:
            - text: Saved models
            - generic [ref=f1e182]: "3"
          - paragraph [ref=f1e183]: Models you've added to your library. Use them in any preset.
        - generic [ref=f1e184]:
          - generic [ref=f1e185]:
            - generic [ref=f1e186]: Search models
            - searchbox "Search models" [active] [ref=f1e187]: Example
          - combobox "Filter saved models by provider" [ref=f1e188]:
            - option "All providers" [selected]
            - option "OpenRouter"
            - option "OpenAI"
            - option "Anthropic"
            - option "Google Gemini"
            - option "Other / local"
        - paragraph [ref=f1e190]: No saved models match your search.
      - region "Explore providers" [ref=f1e191]:
        - heading "Explore providers" [level=2] [ref=f1e192]
        - paragraph [ref=f1e193]: One connection, every model. Choose a provider to discover what's available.
        - group "Provider" [ref=f1e194]:
          - button "OpenRouter" [pressed] [ref=f1e195] [cursor=pointer]
          - button "OpenAI" [ref=f1e198] [cursor=pointer]
          - button "Anthropic" [ref=f1e201] [cursor=pointer]
          - button "Google Gemini" [ref=f1e204] [cursor=pointer]
          - button "Other / local" [ref=f1e207] [cursor=pointer]
        - generic [ref=f1e212]:
          - generic [ref=f1e217]:
            - strong [ref=f1e218]: OpenRouter connected
            - generic [ref=f1e219]: No need to enter the key again. All models from this provider use this connection.
            - generic [ref=f1e220]: Saved encrypted on this PC, protected by your Windows account.
          - generic [ref=f1e221]:
            - button "Test connection" [ref=f1e222] [cursor=pointer]
            - button "Replace key" [ref=f1e223] [cursor=pointer]
            - button "Disconnect" [ref=f1e224] [cursor=pointer]
        - region "OpenRouter model catalog" [ref=f1e225]:
          - generic [ref=f1e226]:
            - generic [ref=f1e227]:
              - strong [ref=f1e228]: Available from OpenRouter
              - generic [ref=f1e229]: 1 models · choose one to add
            - button "Refresh model catalog" [ref=f1e230] [cursor=pointer]: Refresh
          - generic [ref=f1e233]:
            - generic [ref=f1e234]:
              - generic [ref=f1e235]: Search provider models
              - searchbox "Search provider models" [ref=f1e236]
            - combobox "Filter catalog by price" [ref=f1e237]:
              - option "All price ranges" [selected]
              - option "Free models"
              - option "Up to $1 read / $5 write"
            - combobox "Sort catalog" [ref=f1e238]:
              - option "Provider order" [selected]
              - 'option "Name: A–Z"'
              - 'option "Reading price: low first"'
          - button "Example model openai/example Context Not listed $0.15 read · $0.60 write per 1M tokens Add" [ref=f1e240] [cursor=pointer]:
            - generic [ref=f1e242]:
              - strong [ref=f1e243]: Example model
              - generic [ref=f1e244]: openai/example
            - generic [ref=f1e245]:
              - generic [ref=f1e246]: Context
              - text: Not listed
            - generic [ref=f1e247]:
              - text: $0.15 read · $0.60 write
              - generic [ref=f1e248]: per 1M tokens
            - generic [ref=f1e249]: Add
```

# Test source

```ts
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
  173 |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  174 |     "openai/example",
  175 |   );
  176 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  177 |   await expect(dialog).toBeHidden();
  178 |   await page.reload();
  179 |   await page.getByRole("searchbox", { name: "Search models" }).fill("Example");
> 180 |   await expect(page.locator(".model-row")).toHaveCount(1);
      |                                            ^ Error: expect(locator).toHaveCount(expected) failed
  181 |   await expect(page.locator(".model-row img")).toHaveAttribute(
  182 |     "src",
  183 |     "/brands/openai.svg",
  184 |   );
  185 |   await expect
  186 |     .poll(() =>
  187 |       page
  188 |         .locator(".model-row img")
  189 |         .evaluate((img: HTMLImageElement) => img.naturalWidth),
  190 |     )
  191 |     .toBeGreaterThan(0);
  192 | });
  193 | test("provider change clears catalog and matching credentials are reused", async ({
  194 |   page,
  195 | }) => {
  196 |   const settings = await (await page.request.get("/api/models")).json();
  197 |   await page.request.put("/api/models/" + settings.profiles[0].id + "/key", {
  198 |     data: { key: "fixture-only-key" },
  199 |   });
  200 |   await page.goto("/#models");
  201 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  202 |   const dialog = page.getByRole("dialog");
  203 |   await dialog.getByRole("button", { name: "Anthropic", exact: true }).click();
  204 |   await expect(
  205 |     dialog.getByText(
  206 |       "Connect this provider to browse its models. Your key is shared by every model you add from this provider.",
  207 |     ),
  208 |   ).toBeVisible();
  209 |   await expect(
  210 |     dialog.getByRole("button", { name: /Example model.*openai/ }),
  211 |   ).toHaveCount(0);
  212 |   await dialog
  213 |     .getByRole("button", { name: "Other / local", exact: true })
  214 |     .click();
  215 |   await dialog
  216 |     .getByLabel("Provider endpoint")
  217 |     .fill(settings.profiles[0].baseUrl);
  218 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  219 |   await expect(dialog.getByText(/A key is already available/)).toBeVisible();
  220 | });
  221 | 
  222 | test("strict concept opt-in is saved for Anthropic and cleared when switching models", async ({
  223 |   page,
  224 | }) => {
  225 |   await page.route("**/api/model-catalog", (route) =>
  226 |     route.fulfill({
  227 |       json: [
  228 |         {
  229 |           id: "anthropic/claude-haiku-4.5",
  230 |           name: "Haiku test",
  231 |           inputRate: 1,
  232 |           outputRate: 5,
  233 |         },
  234 |       ],
  235 |     }),
  236 |   );
  237 |   await page.goto("/#models");
  238 |   await connectFixture(page);
  239 |   await page
  240 |     .getByRole("button", { name: /Haiku test.*anthropic\/claude-haiku/ })
  241 |     .click();
  242 |   const dialog = page.getByRole("dialog");
  243 |   await dialog
  244 |     .locator("summary")
  245 |     .filter({ hasText: "Fine-tune this model" })
  246 |     .click();
  247 |   await dialog
  248 |     .getByLabel("Check concept response structure", { exact: true })
  249 |     .check();
  250 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  251 |   await expect(dialog).toBeHidden();
  252 |   let settings = await (await page.request.get("/api/models")).json();
  253 |   const saved = settings.profiles.find(
  254 |     (p: any) => p.model === "anthropic/claude-haiku-4.5",
  255 |   );
  256 |   expect(saved.structuredOutput).toBe("anthropic");
  257 |   await page.reload();
  258 |   await page
  259 |     .getByRole("searchbox", { name: "Search models" })
  260 |     .fill("Haiku test");
  261 |   await page
  262 |     .locator(".model-row")
  263 |     .getByRole("button", { name: /Edit/ })
  264 |     .click();
  265 |   await dialog.getByLabel("Model ID", { exact: true }).fill("openai/example");
  266 |   await dialog.getByRole("button", { name: "Save model", exact: true }).click();
  267 |   await expect(dialog).toBeHidden();
  268 |   settings = await (await page.request.get("/api/models")).json();
  269 |   expect(
  270 |     settings.profiles.find((p: any) => p.id === saved.id).structuredOutput,
  271 |   ).toBeUndefined();
  272 | });
  273 | test("Models and Presets pages and dialogs pass accessibility and keep actions visible", async ({
  274 |   page,
  275 | }, info) => {
  276 |   for (const route of ["models", "presets"]) {
  277 |     await page.goto("/#" + route);
  278 |     await expect(
  279 |       page.getByRole("heading", {
  280 |         name: route === "models" ? "Models" : "Presets",
```