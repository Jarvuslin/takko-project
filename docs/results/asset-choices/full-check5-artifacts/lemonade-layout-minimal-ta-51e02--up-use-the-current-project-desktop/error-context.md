# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lemonade-layout.spec.ts >> minimal task list, source, history and follow-up use the current project
- Location: tests\browser\lemonade-layout.spec.ts:193:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 35

- Array []
+ Array [
+   Object {
+     "description": "Ensure the order of headings is semantically correct",
+     "help": "Heading levels should only increase by one",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/heading-order?application=playwright",
+     "id": "heading-order",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "heading-order",
+             "impact": "moderate",
+             "message": "Heading order invalid",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Heading order invalid",
+         "html": "<h3>Find your game’s look and movement</h3>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "div:nth-child(1) > h3",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+ ]
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
                - generic [ref=e90]: r1 · 10:13 PM
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
                - button "Approve brief" [ref=e102] [cursor=pointer]
                - button "Update & replan ↗" [ref=e103] [cursor=pointer]:
                  - text: Update & replan
                  - generic [ref=e104]: ↗
                - button "Configure models" [ref=e105] [cursor=pointer]
              - region "Assets for your brief" [ref=e106]:
                - generic [ref=e107]:
                  - text: ASSETS FOR YOUR BRIEF
                  - heading "Find your game’s look and movement" [level=3] [ref=e108]
                - paragraph [ref=e109]: Takko searches the free Creator Store using your brief. Nothing is inserted yet.
                - paragraph [ref=e110]: Connect Roblox Studio to find free Creator Store options for this brief.
                - button "Preview & choose assets" [ref=e112] [cursor=pointer]
              - group [ref=e113]:
                - generic "✦ Generation activity 1 recorded events · expand" [ref=e114] [cursor=pointer]:
                  - generic [ref=e115]: ✦ Generation activity
                  - generic [ref=e116]: 1 recorded events · expand
              - generic [ref=e117]:
                - text: EXPERIENCE DIRECTION
                - heading "A farming game with a harvest shop" [level=2] [ref=e118]
                - paragraph [ref=e119]: Readable silhouettes and warm lighting
              - group [ref=e120]:
                - generic "Specification · 1 requirements" [ref=e121] [cursor=pointer]
                - article [ref=e123]:
                  - text: mechanic
                  - heading "A farming game with a harvest shop" [level=3] [ref=e124]
                  - paragraph [ref=e125]: The core gameplay state is observable.
                  - generic [ref=e126]: From your request · required
              - button "Approve specification" [ref=e128] [cursor=pointer]
            - group [ref=e129]:
              - generic "⌄ Build plan 1 of 2 complete" [ref=e130] [cursor=pointer]:
                - text: ⌄ Build plan
                - generic [ref=e131]: 1 of 2 complete
              - list [ref=e132]:
                - listitem [ref=e133]:
                  - generic "Complete" [ref=e134]: ✓
                  - group [ref=e135]:
                    - generic "Implement core loop Complete" [ref=e136] [cursor=pointer]:
                      - strong [ref=e137]: Implement core loop
                      - generic [ref=e138]: Complete
                    - paragraph [ref=e139]: 1 scripts · 1 requirements
                    - button "ServerScriptService/Forge_e90036fd1c07/Game.server.luau" [ref=e140] [cursor=pointer]
                - listitem [ref=e141]:
                  - generic "Planned" [ref=e142]: ○
                  - group [ref=e143]:
                    - generic "Harvest shop Planned" [ref=e144] [cursor=pointer]:
                      - strong [ref=e145]: Harvest shop
                      - generic [ref=e146]: Planned
                    - paragraph [ref=e147]: 0 scripts · 1 requirements
                    - paragraph [ref=e148]: "After: Implement core loop"
        - generic [ref=e149]:
          - generic [ref=e150]: Message
          - textbox "Message" [active] [ref=e151]:
            - /placeholder: What would you like to add or change?
            - text: Add a shop with item previews
          - generic [ref=e152]:
            - button "Browse Marketplace assets" [ref=e153] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e156] [cursor=pointer]
            - button "Presets" [ref=e159] [cursor=pointer]
            - button "Budget for this generation" [ref=e162] [cursor=pointer]: Budget
            - button "Send message and update plan" [ref=e163] [cursor=pointer]
          - generic [ref=e166]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
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
  225 |   await page.locator(".compact-plan > summary").click();
  226 |   const plan = page.locator(".plan-aside");
  227 |   await expect(plan).toContainText("Harvest shop");
  228 |   await plan.locator("li summary").filter({ hasText: "Harvest shop" }).click();
  229 |   await expect(plan).toContainText("After: Implement core loop");
  230 |   await expect(
  231 |     plan.locator("li").filter({ hasText: "Implement core loop" }).first(),
  232 |   ).toContainText("Complete");
  233 |   await expect(
  234 |     plan.locator("li").filter({ hasText: "Harvest shop" }),
  235 |   ).toContainText("Planned");
  236 |   await plan
  237 |     .locator("li summary")
  238 |     .filter({ hasText: "Implement core loop" })
  239 |     .click();
  240 |   await plan
  241 |     .getByRole("button", { name: /ServerScriptService.*Game.server.luau/ })
  242 |     .click();
  243 |   await expect(
  244 |     page.getByRole("dialog", { name: "Source details" }),
  245 |   ).toBeVisible();
  246 |   await page.keyboard.press("Escape");
  247 |   await page.getByRole("button", { name: "History", exact: true }).click();
  248 |   await expect(
  249 |     page.getByRole("heading", { name: "Conversation history" }),
  250 |   ).toBeVisible();
  251 |   await page.keyboard.press("Escape");
  252 |   await page.getByLabel("Message", { exact: true }).focus();
  253 |   await page
  254 |     .getByLabel("Message", { exact: true })
  255 |     .fill("Add a shop with item previews");
  256 |   await expect(page.getByLabel("Message", { exact: true })).toBeFocused();
  257 |   // The inspection and unsent message interactions must not mutate the saved project.
  258 |   const unchanged = await (
  259 |     await page.request.get("/api/projects/" + created.id)
  260 |   ).json();
  261 |   expect(unchanged.revision).toBe(created.revision);
  262 |   expect(unchanged.request).toBe(created.request);
> 263 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      |                                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  264 |   expect(
  265 |     await page.evaluate(
  266 |       () => document.documentElement.scrollWidth <= innerWidth,
  267 |     ),
  268 |   ).toBe(true);
  269 |   await page.screenshot({
  270 |     path: `docs/results/forge-minimal-workspace-${testInfo.project.name}.png`,
  271 |     fullPage: true,
  272 |   });
  273 | });
  274 | 
  275 | test("sending a follow-up preserves the original request and updates the plan once", async ({
  276 |   page,
  277 | }) => {
  278 |   const created = await (
  279 |     await page.request.post("/api/projects", {
  280 |       data: { request: "A cooperative farming game" },
  281 |     })
  282 |   ).json();
  283 |   let plans = 0;
  284 |   await page.route("**/api/projects/" + created.id + "/plan", async (route) => {
  285 |     plans++;
  286 |     const saved = await (
  287 |       await page.request.get("/api/projects/" + created.id)
  288 |     ).json();
  289 |     expect(route.request().postDataJSON().revision).toBe(saved.revision);
  290 |     await route.fulfill({
  291 |       json: { ...saved, spec: specification(saved.request, saved.scope) },
  292 |     });
  293 |   });
  294 |   await page.goto("/?project=" + created.id);
  295 |   await page
  296 |     .getByLabel("Message", { exact: true })
  297 |     .fill("Add a crop selling shop");
  298 |   await page
  299 |     .getByRole("button", { name: "Send message and update plan" })
  300 |     .click();
  301 |   await expect(page.getByLabel("Project request")).toHaveValue(
  302 |     "A cooperative farming game",
  303 |   );
  304 |   await expect(page.getByLabel("Message", { exact: true })).toBeEmpty();
  305 |   expect(plans).toBe(1);
  306 |   await page.reload();
  307 |   await expect(page.getByLabel("Saved conversation")).toContainText(
  308 |     "Add a crop selling shop",
  309 |   );
  310 | });
  311 | 
```