# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lemonade-layout.spec.ts >> minimal task list, source, history and follow-up use the current project
- Location: tests\browser\lemonade-layout.spec.ts:193:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Build plan · 2 tasks', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
    - button "New project" [ref=e8] [cursor=pointer]
    - button "Marketplace" [ref=e12] [cursor=pointer]
    - navigation "Workspace" [ref=e16]:
      - button "Models" [ref=e17] [cursor=pointer]
      - button "Presets" [ref=e21] [cursor=pointer]
    - group [ref=e25]:
      - generic "Projects" [ref=e26] [cursor=pointer]
    - link "Download plugin" [ref=e31] [cursor=pointer]:
      - /url: /api/studio/plugin
  - main [ref=e35]:
    - generic [ref=e36]:
      - generic [ref=e37]: Workspace/A farming game with a harvest shop
      - generic [ref=e38]:
        - button "Connect to Studio" [ref=e39] [cursor=pointer]
        - button "Models" [ref=e41] [cursor=pointer]
    - generic [ref=e44]:
      - region "Game architecture" [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - generic [ref=e48]: Your game, connected
            - strong [ref=e49]: Game architecture
            - generic [ref=e50]: draft · Game architecture
          - generic [ref=e51]:
            - button "Build details" [ref=e52] [cursor=pointer]: Build
            - button "Source details" [ref=e53] [cursor=pointer]: Source
            - button "Studio details" [ref=e54] [cursor=pointer]: Studio
        - generic [ref=e55]:
          - generic [ref=e56]: 0 systems · 0 connections
          - button "Connections" [ref=e57] [cursor=pointer]
          - button "Add system" [ref=e58] [cursor=pointer]
        - generic "Architecture canvas" [ref=e59]:
          - generic [ref=e60]:
            - strong [ref=e61]: Start with your first game system
            - paragraph [ref=e62]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=e63] [cursor=pointer]
            - generic [ref=e64]: Combat · Inventory · Quests
          - generic [ref=e65]:
            - img "System connections"
        - generic "Canvas controls" [ref=e66]:
          - button "Zoom out canvas" [ref=e67] [cursor=pointer]: −
          - generic [ref=e68]: 100%
          - button "Zoom in canvas" [ref=e69] [cursor=pointer]: +
          - button "Fit" [ref=e70] [cursor=pointer]
          - button "Auto layout" [ref=e71] [cursor=pointer]
      - separator "Resize Takko panel" [ref=e72]
      - heading "A farming game with a harvest shop" [level=1] [ref=e73]
      - region "Project conversation" [ref=e74]:
        - generic [ref=e75]:
          - strong [ref=e77]: Takko
          - generic [ref=e78]: draft
          - button "Latest ↓" [ref=e79] [cursor=pointer]
          - button "History" [ref=e80] [cursor=pointer]
        - generic [ref=e83]:
          - generic [ref=e84]: $0.0000 / $0.2500
          - generic "Saved conversation" [ref=e86]:
            - article [ref=e87]:
              - generic [ref=e88]:
                - strong [ref=e89]: You
                - generic [ref=e90]: r1 · 02:58 PM
              - paragraph [ref=e91]: A farming game with a harvest shop
          - group [ref=e92]:
            - generic "Preview an animation clip" [ref=e93] [cursor=pointer]
          - button "Review how the systems interact and identify anything the player cannot complete." [ref=e95] [cursor=pointer]:
            - text: Review how the systems interact and identify anything the player cannot complete.
            - generic [aria-hidden] [ref=e96]: ↗
          - generic [ref=e97]:
            - generic [ref=e98]:
              - region "Studio in conversation"
              - group [ref=e99]:
                - generic "Edit original brief" [ref=e100] [cursor=pointer]
              - generic [ref=e101]:
                - button "Update & replan ↗" [ref=e102] [cursor=pointer]:
                  - text: Update & replan
                  - generic [ref=e103]: ↗
                - button "Configure models" [ref=e104] [cursor=pointer]
              - group [ref=e105]:
                - generic "✦ Generation activity 1 recorded events · expand" [ref=e106] [cursor=pointer]:
                  - generic [ref=e107]: ✦ Generation activity
                  - generic [ref=e108]: 1 recorded events · expand
              - generic [ref=e109]:
                - text: EXPERIENCE DIRECTION
                - heading "A farming game with a harvest shop" [level=2] [ref=e110]
                - paragraph [ref=e111]: Readable silhouettes and warm lighting
              - group [ref=e112]:
                - generic "Specification · 1 requirements" [ref=e113] [cursor=pointer]
                - generic [ref=e114]:
                  - heading "What the game needs" [level=2] [ref=e115]
                  - generic [ref=e116]: 1 requirements
                - article [ref=e118]:
                  - text: mechanic
                  - heading "A farming game with a harvest shop" [level=3] [ref=e119]
                  - paragraph [ref=e120]: The core gameplay state is observable.
                  - generic [ref=e121]: From your request · required
              - button "Approve specification" [ref=e123] [cursor=pointer]
            - group [ref=e124]:
              - generic "› Build plan 1 of 2 complete" [ref=e125] [cursor=pointer]:
                - text: › Build plan
                - generic [ref=e126]: 1 of 2 complete
        - generic [ref=e127]:
          - generic [ref=e128]: Message
          - textbox "Message" [ref=e129]:
            - /placeholder: What would you like to add or change?
          - generic [ref=e130]:
            - button "Browse Marketplace assets" [ref=e131] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e134] [cursor=pointer]
            - button "Presets" [ref=e137] [cursor=pointer]
            - button "Budget for this generation" [ref=e140] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e141]
          - generic [ref=e144]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
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
  183 |     await page.request.put("/api/models", {
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
> 225 |   await page.getByText("Build plan · 2 tasks", { exact: true }).click();
      |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  239 |     page.getByRole("dialog", { name: "Source details" }),
  240 |   ).toBeVisible();
  241 |   await page.keyboard.press("Escape");
  242 |   await page.getByRole("button", { name: "History", exact: true }).click();
  243 |   await expect(
  244 |     page.getByRole("heading", { name: "Conversation history" }),
  245 |   ).toBeVisible();
  246 |   await page.keyboard.press("Escape");
  247 |   await page.getByLabel("Message", { exact: true }).focus();
  248 |   await page
  249 |     .getByLabel("Message", { exact: true })
  250 |     .fill("Add a shop with item previews");
  251 |   await expect(page.getByLabel("Message", { exact: true })).toBeFocused();
  252 |   // The inspection and unsent message interactions must not mutate the saved project.
  253 |   const unchanged = await (
  254 |     await page.request.get("/api/projects/" + created.id)
  255 |   ).json();
  256 |   expect(unchanged.revision).toBe(created.revision);
  257 |   expect(unchanged.request).toBe(created.request);
  258 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  259 |   expect(
  260 |     await page.evaluate(
  261 |       () => document.documentElement.scrollWidth <= innerWidth,
  262 |     ),
  263 |   ).toBe(true);
  264 |   await page.screenshot({
  265 |     path: `docs/results/forge-minimal-workspace-${testInfo.project.name}.png`,
  266 |     fullPage: true,
  267 |   });
  268 | });
  269 | 
  270 | test("sending a follow-up preserves the original request and updates the plan once", async ({
  271 |   page,
  272 | }) => {
  273 |   const created = await (
  274 |     await page.request.post("/api/projects", {
  275 |       data: { request: "A cooperative farming game" },
  276 |     })
  277 |   ).json();
  278 |   let plans = 0;
  279 |   await page.route("**/api/projects/" + created.id + "/plan", async (route) => {
  280 |     plans++;
  281 |     const saved = await (
  282 |       await page.request.get("/api/projects/" + created.id)
  283 |     ).json();
  284 |     expect(route.request().postDataJSON().revision).toBe(saved.revision);
  285 |     await route.fulfill({
  286 |       json: { ...saved, spec: specification(saved.request, saved.scope) },
  287 |     });
  288 |   });
  289 |   await page.goto("/?project=" + created.id);
  290 |   await page
  291 |     .getByLabel("Message", { exact: true })
  292 |     .fill("Add a crop selling shop");
  293 |   await page
  294 |     .getByRole("button", { name: "Send message and update plan" })
  295 |     .click();
  296 |   await expect(page.getByLabel("Project request")).toHaveValue(
  297 |     "A cooperative farming game",
  298 |   );
  299 |   await expect(page.getByLabel("Message", { exact: true })).toBeEmpty();
  300 |   expect(plans).toBe(1);
  301 |   await page.reload();
  302 |   await expect(page.getByLabel("Saved conversation")).toContainText(
  303 |     "Add a crop selling shop",
  304 |   );
  305 | });
  306 | 
```