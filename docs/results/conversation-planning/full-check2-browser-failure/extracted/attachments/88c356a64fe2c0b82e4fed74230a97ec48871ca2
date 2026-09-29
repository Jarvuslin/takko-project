# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> welcomes multiple game ideas without generating a preset or claiming a connection
- Location: tests\browser\workflow.spec.ts:107:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByLabel('Project request')
Expected pattern: /farming/
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByLabel('Project request') with timeout 5000ms
  - waiting for getByLabel('Project request')

```

```yaml
- complementary:
  - link "Takko home":
    - /url: /
  - button "New project"
  - button "Marketplace"
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
  - group: Projects
  - link "Download plugin":
    - /url: /api/studio/plugin
- main:
  - text: Workspace/Make a farming loop with crop growth, harvesting, selling and a
  - button "Connect to Studio"
  - button "Models"
  - region "Looking for Studio…":
    - text: YOUR PROJECT · Make a farming loop with crop growth, harvesting, selling and a
    - heading "Looking for Studio…" [level=1]
    - paragraph: Connect Roblox Studio to find Marketplace assets, preview animations and build your game.
    - status: Checking the Studio connection…
    - button "Checking…" [disabled]
    - button "Continue offline"
    - text: Offline mode lets you write and refine your brief. Architecture and Studio tools become available when you connect. Model calls still require an internet connection. SET UP ONCE
    - heading "Open Studio. Connect. Create." [level=2]
    - list:
      - listitem:
        - strong: Open your place in Roblox Studio
        - paragraph: Sign in, then open an existing place or a new Baseplate. Leave it in Edit mode.
      - listitem:
        - strong: Enable Studio’s connection
        - paragraph: Open Assistant, then its settings or ⋯ menu. Choose MCP Servers (or Manage MCP Servers) and turn on Enable Studio as MCP server.
      - listitem:
        - strong: Return here and connect
        - paragraph: Click Connect to Studio. Takko checks for your open Studio sessions. You can select the place to use when browsing assets.
    - link "Roblox’s connection guide ↗":
      - /url: https://create.roblox.com/docs/studio/mcp
    - group: Set up the Takko plugin for applying builds
```

# Test source

```ts
  21  |   await page.keyboard.press("Escape");
  22  |   await expect(dialog).toBeHidden();
  23  |   await expect(launcher).toBeFocused();
  24  | });
  25  | 
  26  | test("project selection survives refresh and detail controls support keyboard activation", async ({
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
  39  |   const build = page.getByRole("button", {
  40  |     name: "Build details",
  41  |     exact: true,
  42  |   });
  43  |   await build.focus();
  44  |   await build.press("Enter");
  45  |   await expect(
  46  |     page.getByRole("dialog", { name: "Build details" }),
  47  |   ).toBeVisible();
  48  |   await page.keyboard.press("Escape");
  49  |   await expect(build).toBeFocused();
  50  |   await page
  51  |     .getByRole("button", { name: "Studio details", exact: true })
  52  |     .press("Enter");
  53  |   await expect(
  54  |     page.getByRole("dialog", { name: "Studio details" }),
  55  |   ).toBeVisible();
  56  | });
  57  | 
  58  | test("catalog search selects a model and its published rates", async ({
  59  |   page,
  60  | }) => {
  61  |   await page.request.put("/api/models", {
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
> 121 |   await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
      |                                                    ^ Error: expect(locator).toHaveValue(expected) failed
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
  162 |     .getByRole("button", { name: "Edit My model", exact: true })
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
```