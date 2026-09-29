# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lemonade-layout.spec.ts >> minimal prompt and saved preset preserve real role preferences
- Location: tests\browser\lemonade-layout.spec.ts:126:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: apiRequestContext.put: Test timeout of 30000ms exceeded.
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
        - tab "Model library 2" [ref=e30] [cursor=pointer]:
          - text: Model library
          - generic [ref=e31]: "2"
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
            - generic [ref=e51]: Large model
          - generic [ref=e55]:
            - generic [ref=e56]: Builder
            - generic [ref=e57]: Large model
          - generic [ref=e61]:
            - generic [ref=e62]: Reviewer
            - generic [ref=e63]: Large model
          - generic [ref=e67]:
            - generic [ref=e68]: Repair
            - generic [ref=e69]: Large model
        - generic [ref=e73]:
          - generic [ref=e74]: $0.25 / generation
          - generic [ref=e75]: $0.25 / project
        - generic [ref=e76]:
          - button "Edit My first preset" [ref=e77] [cursor=pointer]: Edit preset
          - button "In use" [disabled] [ref=e78]
```

# Test source

```ts
  83  |     page.getByRole("link", { name: "Original Roblox experience" }),
  84  |   ).toHaveAttribute("href", fixture.research.sources[0].url);
  85  |   expect(
  86  |     await page.evaluate(
  87  |       () => document.documentElement.scrollWidth <= innerWidth,
  88  |     ),
  89  |   ).toBe(true);
  90  | });
  91  | 
  92  | test("shows a concise generation failure with expandable diagnostics", async ({
  93  |   page,
  94  | }) => {
  95  |   const p = await (
  96  |     await page.request.post("/api/projects", {
  97  |       data: { request: "Build a cookie scene" },
  98  |     })
  99  |   ).json();
  100 |   const fixture = {
  101 |     ...p,
  102 |     spec: specification(p.request, p.scope),
  103 |     stage: "failed",
  104 |     error: "Could not complete Cookie scene. Unsupported class CookieShape.",
  105 |     failure: {
  106 |       code: "GENERATION_OUTPUT_REJECTED",
  107 |       phase: "builder",
  108 |       taskId: "coreTask",
  109 |       attempts: 2,
  110 |       details:
  111 |         "Scene node Workspace/Forge_Test/Cookie uses unsupported class CookieShape.",
  112 |       at: p.createdAt,
  113 |     },
  114 |   };
  115 |   await page.route("**/api/projects/" + p.id, (route) =>
  116 |     route.fulfill({ json: fixture }),
  117 |   );
  118 |   await page.goto("/?project=" + p.id);
  119 |   const alert = page.getByRole("alert");
  120 |   await expect(alert).toContainText("Could not complete Cookie scene");
  121 |   await alert.getByText("Generation diagnostics", { exact: true }).click();
  122 |   await expect(alert.locator("pre")).toBeVisible();
  123 |   await expect(alert.locator("pre")).toContainText("CookieShape");
  124 | });
  125 | 
  126 | test("minimal prompt and saved preset preserve real role preferences", async ({
  127 |   page,
  128 | }, testInfo) => {
  129 |   const economy = {
  130 |     ...profile(),
  131 |     name: "Economy model",
  132 |     model: "fixture/economy",
  133 |     outputRate: 0.4,
  134 |   };
  135 |   const large = {
  136 |     ...profile(),
  137 |     name: "Large model",
  138 |     model: "fixture/large",
  139 |     outputRate: 8,
  140 |   };
  141 |   const settings = {
  142 |     profiles: [economy, large],
  143 |     routes: {
  144 |       research: [large.id],
  145 |       planner: [large.id],
  146 |       builder: [large.id],
  147 |       reviewer: [large.id],
  148 |       repair: [large.id],
  149 |     },
  150 |     budgetMicros: 250000,
  151 |     repairLimit: 1,
  152 |   };
  153 |   await page.request.put("/api/models", { data: settings });
  154 |   try {
  155 |     await page.goto("/");
  156 |     await page
  157 |       .getByLabel("Game idea")
  158 |       .fill("Build a shop UI with item previews");
  159 |     await expect(page.getByLabel("Game idea")).toBeFocused();
  160 |     await page
  161 |       .getByRole("button", { name: "Presets", exact: true })
  162 |       .last()
  163 |       .click();
  164 |     await page
  165 |       .getByRole("button", { name: "Edit My first preset", exact: true })
  166 |       .click();
  167 |     await page.getByLabel("builder primary").selectOption(economy.id);
  168 |     await page
  169 |       .getByRole("button", { name: "Save preset", exact: true })
  170 |       .click();
  171 |     const saved = await (await page.request.get("/api/models")).json();
  172 |     expect(saved.routes).toEqual({ ...settings.routes, builder: [economy.id] });
  173 |     expect(saved.budgetMicros).toBe(250000);
  174 |     await page.goBack();
  175 |     await expect(page.getByLabel("Game idea")).toHaveValue(
  176 |       "Build a shop UI with item previews",
  177 |     );
  178 |     await page.screenshot({
  179 |       path: `docs/results/forge-minimal-dashboard-${testInfo.project.name}.png`,
  180 |       fullPage: true,
  181 |     });
  182 |   } finally {
> 183 |     await page.request.put("/api/models", {
      |                        ^ Error: apiRequestContext.put: Test timeout of 30000ms exceeded.
  184 |       data: {
  185 |         ...settings,
  186 |         profiles: [],
  187 |         routes: { planner: [], builder: [], reviewer: [], repair: [] },
  188 |       },
  189 |     });
  190 |   }
  191 | });
  192 | 
  193 | test("minimal task list, source, history and follow-up use the current project", async ({
  194 |   page,
  195 | }, testInfo) => {
  196 |   const created = await (
  197 |     await page.request.post("/api/projects", {
  198 |       data: { request: "A farming game with a harvest shop" },
  199 |     })
  200 |   ).json();
  201 |   const spec = specification(created.request, created.scope);
  202 |   spec.tasks.push({
  203 |     id: "shop",
  204 |     title: "Harvest shop",
  205 |     requirements: ["core"],
  206 |     dependsOn: ["coreTask"],
  207 |     files: [],
  208 |   });
  209 |   const fixture = {
  210 |     ...created,
  211 |     spec,
  212 |     completedBuildTasks: ["coreTask"],
  213 |     events: [{ at: created.createdAt, message: "Fixture plan recorded" }],
  214 |   };
  215 |   await page.route("**/api/projects/" + created.id, (route) =>
  216 |     route.request().method() === "GET"
  217 |       ? route.fulfill({ json: fixture })
  218 |       : route.continue(),
  219 |   );
  220 |   await page.goto("/?project=" + created.id);
  221 |   await expect(page.getByLabel("Mechanics map")).toHaveCount(0);
  222 |   await expect(
  223 |     page.getByRole("button", { name: "Explore", exact: true }),
  224 |   ).toHaveCount(0);
  225 |   await page.getByText("Build plan · 2 tasks", { exact: true }).click();
  226 |   const plan = page.locator(".plan-aside");
  227 |   await expect(plan).toContainText("Harvest shop");
  228 |   await expect(plan).toContainText("Depends on: coreTask");
  229 |   await expect(
  230 |     plan.locator("article").filter({ hasText: "Implement core loop" }),
  231 |   ).toContainText("Completed");
  232 |   await expect(
  233 |     plan.locator("article").filter({ hasText: "Harvest shop" }),
  234 |   ).toContainText("Planned");
  235 |   await plan
  236 |     .getByRole("button", { name: /ServerScriptService.*Game.server.luau/ })
  237 |     .click();
  238 |   await expect(
  239 |     page.getByRole("tab", { name: "Source", exact: true }),
  240 |   ).toHaveAttribute("aria-selected", "true");
  241 |   await page.getByRole("button", { name: "History", exact: true }).click();
  242 |   await expect(
  243 |     page.getByRole("heading", { name: "Project activity" }),
  244 |   ).toBeVisible();
  245 |   await page.getByRole("button", { name: "History", exact: true }).click();
  246 |   await page.getByRole("tab", { name: "Brief", exact: true }).click();
  247 |   await page
  248 |     .getByLabel("Message", { exact: true })
  249 |     .fill("Add a shop with item previews");
  250 |   await expect(page.getByLabel("Message", { exact: true })).toBeFocused();
  251 |   // The inspection and unsent message interactions must not mutate the saved project.
  252 |   const unchanged = await (
  253 |     await page.request.get("/api/projects/" + created.id)
  254 |   ).json();
  255 |   expect(unchanged.revision).toBe(created.revision);
  256 |   expect(unchanged.request).toBe(created.request);
  257 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  258 |   expect(
  259 |     await page.evaluate(
  260 |       () => document.documentElement.scrollWidth <= innerWidth,
  261 |     ),
  262 |   ).toBe(true);
  263 |   await page.screenshot({
  264 |     path: `docs/results/forge-minimal-workspace-${testInfo.project.name}.png`,
  265 |     fullPage: true,
  266 |   });
  267 | });
  268 | 
  269 | test("sending a follow-up preserves the original request and updates the plan once", async ({
  270 |   page,
  271 | }) => {
  272 |   const created = await (
  273 |     await page.request.post("/api/projects", {
  274 |       data: { request: "A cooperative farming game" },
  275 |     })
  276 |   ).json();
  277 |   let plans = 0;
  278 |   await page.route("**/api/projects/" + created.id + "/plan", async (route) => {
  279 |     plans++;
  280 |     const saved = await (
  281 |       await page.request.get("/api/projects/" + created.id)
  282 |     ).json();
  283 |     expect(route.request().postDataJSON().revision).toBe(saved.revision);
```