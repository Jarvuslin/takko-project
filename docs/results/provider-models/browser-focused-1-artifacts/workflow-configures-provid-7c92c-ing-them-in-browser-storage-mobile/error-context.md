# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> configures provider keys without reflecting secrets or persisting them in browser storage
- Location: tests\browser\workflow.spec.ts:132:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Edit My model', exact: true })

```

# Test source

```ts
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
  88  |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  89  |     "test/economy",
  90  |   );
  91  |   await expect(dialog.getByLabel("Reading price")).toHaveValue("0.1");
  92  |   await expect(dialog.getByLabel("Writing price")).toHaveValue("0.4");
  93  |   expect(
  94  |     (await (await page.request.get("/api/models")).json()).profiles,
  95  |   ).toHaveLength(0);
  96  |   await dialog.getByRole("button", { name: "Add to library" }).click();
  97  |   await expect(dialog).toBeHidden();
  98  |   const saved = await (await page.request.get("/api/models")).json();
  99  |   expect(saved.profiles[0].model).toBe("test/economy");
  100 |   await page.request.delete("/api/model-profiles/" + saved.profiles[0].id);
  101 | });
  102 | 
  103 | test("welcomes multiple game ideas without generating a preset or claiming a connection", async ({
  104 |   page,
  105 | }, testInfo) => {
  106 |   await page.goto("/");
  107 |   await expect(
  108 |     page.getByRole("heading", { name: "What do you want to build?" }),
  109 |   ).toBeVisible();
  110 |   await page
  111 |     .getByLabel("Game idea")
  112 |     .fill(
  113 |       "Make a farming loop with crop growth, harvesting, selling and a shop",
  114 |     );
  115 |   await expect(page.getByLabel("Game idea")).toHaveValue(/farming/);
  116 |   await page.getByRole("button", { name: "Create project" }).click();
  117 |   await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
  118 |   await page.getByRole("button", { name: "Plan this game" }).click();
  119 |   await expect(page.getByRole("alert")).toContainText("Configure");
  120 |   await page
  121 |     .getByRole("button", { name: "Studio details", exact: true })
  122 |     .click();
  123 |   await expect(page.getByText("Awaiting connection")).toBeVisible();
  124 |   await expect(
  125 |     page.getByRole("link", { name: "Download Takko.rbxmx" }),
  126 |   ).toHaveAttribute("href", "/api/studio/plugin");
  127 |   await page.screenshot({
  128 |     path: `docs/results/forge-v2-studio-${testInfo.project.name}.png`,
  129 |     fullPage: true,
  130 |   });
  131 | });
  132 | test("configures provider keys without reflecting secrets or persisting them in browser storage", async ({
  133 |   page,
  134 | }) => {
  135 |   await page.request.put("/api/models", {
  136 |     data: {
  137 |       profiles: [],
  138 |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  139 |       budgetMicros: 2e6,
  140 |       repairLimit: 1,
  141 |     },
  142 |   });
  143 |   await page.goto("/#models");
  144 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  145 |   const dialog = page.getByRole("dialog");
  146 |   await connectFixture(page, true);
  147 |   await dialog
  148 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  149 |     .click();
  150 |   await dialog.getByLabel("Library name").fill("My model");
  151 |   await dialog.getByLabel("Model ID", { exact: true }).fill("test/model");
  152 | 
  153 |   await dialog.getByLabel("Reading price").fill("0.1");
  154 |   await dialog.getByLabel("Writing price").fill("0.2");
  155 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  156 |   await expect(dialog).toBeHidden();
  157 |   await page
  158 |     .getByRole("button", { name: "Edit My model", exact: true })
> 159 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  160 |   await expect(
  161 |     dialog.getByText(/No need to enter the key again/),
  162 |   ).toBeVisible();
  163 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveCount(0);
  164 |   const settings = await (await page.request.get("/api/models")).text();
  165 |   expect(settings).not.toContain("browser-test-secret");
  166 |   expect(
  167 |     await page.evaluate(
  168 |       () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
  169 |     ),
  170 |   ).not.toContain("browser-test-secret");
  171 |   await dialog
  172 |     .getByRole("button", { name: "Remove model", exact: true })
  173 |     .click();
  174 |   await dialog.getByRole("button", { name: "Remove from library" }).click();
  175 |   await expect(dialog).toBeHidden();
  176 | });
  177 | 
  178 | test("keeps the model editor open when saving fails", async ({ page }) => {
  179 |   await page.goto("/#models");
  180 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  181 |   await page.route("**/api/model-profiles/*", (r) =>
  182 |     r.fulfill({
  183 |       status: 400,
  184 |       json: { error: "Unable to save model settings" },
  185 |     }),
  186 |   );
  187 |   const dialog = page.getByRole("dialog");
  188 |   await connectFixture(page, true);
  189 |   await dialog
  190 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  191 |     .click();
  192 |   await dialog.getByLabel("Model ID", { exact: true }).fill("sample/model");
  193 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  194 |   await expect(dialog).toBeVisible();
  195 |   await expect(dialog.getByRole("alert")).toContainText(
  196 |     "Unable to save model settings",
  197 |   );
  198 | });
  199 | 
  200 | test("welcome and model settings pass accessibility checks and fit the viewport", async ({
  201 |   page,
  202 | }, testInfo) => {
  203 |   await page.goto("/");
  204 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  205 |   expect(
  206 |     await page.evaluate(
  207 |       () => document.documentElement.scrollWidth <= innerWidth,
  208 |     ),
  209 |   ).toBe(true);
  210 |   await page.screenshot({
  211 |     path: `docs/results/forge-v2-welcome-${testInfo.project.name}.png`,
  212 |     fullPage: true,
  213 |   });
  214 |   await page
  215 |     .locator(".topbar")
  216 |     .getByRole("button", { name: "Models", exact: true })
  217 |     .click();
  218 |   expect(
  219 |     (await new AxeBuilder({ page }).include(".settings-workspace").analyze())
  220 |       .violations,
  221 |   ).toEqual([]);
  222 | });
  223 | test("builds an approved non-combat project through a real HTTP provider adapter", async ({
  224 |   page,
  225 | }, testInfo) => {
  226 |   const transport = fakeTransport({ question: true });
  227 |   const server = createServer(async (req, res) => {
  228 |     let body = "";
  229 |     for await (const chunk of req) body += chunk;
  230 |     const response = await transport("http://fixture", {
  231 |       method: "POST",
  232 |       body,
  233 |     });
  234 |     res.writeHead(200, { "Content-Type": "application/json" });
  235 |     res.end(await response.text());
  236 |   });
  237 |   await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  238 |   const model = {
  239 |     ...profile(),
  240 |     baseUrl:
  241 |       "http://127.0.0.1:" + (server.address() as { port: number }).port + "/v1",
  242 |   };
  243 |   try {
  244 |     await page.request.put("/api/models", {
  245 |       data: {
  246 |         profiles: [model],
  247 |         routes: {
  248 |           planner: [model.id],
  249 |           builder: [model.id],
  250 |           reviewer: [model.id],
  251 |           repair: [model.id],
  252 |         },
  253 |         budgetMicros: 2e6,
  254 |         repairLimit: 1,
  255 |       },
  256 |     });
  257 |     await page.goto("/");
  258 |     await page.getByLabel("Game idea").fill("Build a farming game");
  259 |     await page.getByRole("button", { name: "Create project" }).click();
```