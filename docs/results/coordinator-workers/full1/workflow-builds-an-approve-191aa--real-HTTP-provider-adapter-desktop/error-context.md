# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> builds an approved non-combat project through a real HTTP provider adapter
- Location: tests\browser\workflow.spec.ts:227:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('From your clarification')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('From your clarification') with timeout 5000ms
  - waiting for getByText('From your clarification')

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
  - text: Workspace/Orchard
  - button "Connect to Studio"
  - button "Models"
  - region "Game architecture":
    - text: Your game, connected
    - strong: Game architecture
    - text: review · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - strong: Start with your first game system
    - paragraph: Describe your game to Takko, or add a system using the toolbar.
    - button "Ask Takko"
    - text: Combat · Inventory · Quests
    - img "System connections"
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - separator "Resize Takko panel"
  - heading "Orchard" [level=1]
  - region "Project conversation":
    - strong: Takko
    - text: review
    - button "Latest ↓"
    - button "History"
    - text: $0.0020 / $2.0000
    - article:
      - strong: You
      - text: r1 · 02:42 PM
      - paragraph: Build a farming game
    - article:
      - strong: Takko
      - text: r2 · 02:42 PM
      - paragraph: Build a farming game
      - group: Saved plan · Orchard
      - group: clarification · Activity · $0.0010
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: You
      - text: r3 · 02:42 PM
      - strong: Clarifications
      - term: Which devices?
      - definition: Desktop
      - button "Edit answers"
    - article:
      - strong: Takko
      - text: r3 · 02:42 PM
      - paragraph: Build a farming game
      - group: Saved plan · Orchard
      - group: review · Activity · $0.0010
      - button "Helpful"
      - button "Needs work"
    - group: Preview an animation clip
    - button "Review how the systems interact and identify anything the player cannot complete."
    - region "Studio in conversation"
    - group: Edit original brief
    - button "Approve brief"
    - button "Update & replan ↗"
    - button "Configure models"
    - region "Assets for your brief":
      - text: ASSETS FOR YOUR BRIEF
      - heading "Find your game’s look and movement" [level=2]
      - paragraph: Takko searches the free Creator Store using your brief. Nothing is inserted yet.
      - button "Preview & choose assets"
    - text: EXPERIENCE DIRECTION
    - heading "Build a farming game" [level=2]
    - paragraph: Readable silhouettes and warm lighting
    - group:
      - text: Specification · 1 requirements
      - article:
        - text: mechanic
        - heading "Build a farming game" [level=3]
        - paragraph: The core gameplay state is observable.
        - text: From your request · required
    - button "Approve specification"
    - group: › Coordinator activity 2 completed assignments
    - group: › Build plan 0 of 1 complete
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
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
  263 |     await page.getByRole("button", { name: "Create project" }).click();
  264 |     await page.getByRole("button", { name: "Plan this game" }).click();
  265 |     await expect(
  266 |       page.getByRole("button", { name: "Approve specification" }),
  267 |     ).toBeDisabled();
  268 |     await page.getByRole("radio", { name: "Desktop", exact: true }).click();
  269 |     await page
  270 |       .getByRole("button", { name: "Save answers & update plan" })
  271 |       .click();
  272 |     await expect(
  273 |       page.getByRole("button", { name: "Approve specification" }),
  274 |     ).toBeEnabled();
  275 |     await expect(
  276 |       page.getByText("From your clarification", { exact: false }),
> 277 |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  278 |     await page.screenshot({
  279 |       path: `docs/results/forge-v2-brief-${testInfo.project.name}.png`,
  280 |       fullPage: true,
  281 |     });
  282 |     await page.getByRole("button", { name: "Approve specification" }).click();
  283 |     await expect(
  284 |       page.getByRole("dialog", { name: "Build details" }),
  285 |     ).toHaveCount(0);
  286 |     await page.getByRole("button", { name: "Generate game" }).click();
  287 |     await expect(
  288 |       page.getByText("ready to test", { exact: true }),
  289 |     ).toBeVisible();
  290 |     await page
  291 |       .getByRole("button", { name: "Source details", exact: true })
  292 |       .click();
  293 |     const sourceCode = page
  294 |       .getByRole("dialog", { name: "Source details" })
  295 |       .locator("code");
  296 |     await expect(sourceCode).toContainText("Harvest");
  297 |     await expect(sourceCode).not.toContainText("CombatCore");
  298 |     await expect(
  299 |       page.getByRole("link", { name: "Download place" }),
  300 |     ).toBeVisible();
  301 |     const projectId = new URL(page.url()).searchParams.get("project");
  302 |     await page.route("**/api/projects/" + projectId, async (route) => {
  303 |       const response = await route.fetch();
  304 |       const project = await response.json();
  305 |       await route.fulfill({
  306 |         response,
  307 |         json: {
  308 |           ...project,
  309 |           stage: "failed",
  310 |           checks: [],
  311 |           error: "Builder stopped before final validation",
  312 |         },
  313 |       });
  314 |     });
  315 |     await page.reload();
  316 |     await page
  317 |       .getByRole("button", { name: "Source details", exact: true })
  318 |       .click();
  319 |     await expect(
  320 |       page.getByRole("link", { name: "Download place" }),
  321 |     ).toHaveCount(0);
  322 |   } finally {
  323 |     await page.request.put("/api/models", {
  324 |       data: {
  325 |         profiles: [],
  326 |         routes: { planner: [], builder: [], reviewer: [], repair: [] },
  327 |         budgetMicros: 2e6,
  328 |         repairLimit: 1,
  329 |       },
  330 |     });
  331 |     server.closeAllConnections();
  332 |     await new Promise<void>((r) => server.close(() => r()));
  333 |   }
  334 | });
  335 | import { mockProviderConnections, connectFixture } from "./provider-fixture";
  336 | test.beforeEach(async ({ page }) => {
  337 |   await mockProviderConnections(page);
  338 | });
  339 | 
  340 | test.afterEach(async ({ page }) => {
  341 |   await page.unrouteAll({ behavior: "ignoreErrors" });
  342 | });
  343 | 
```