# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lemonade-layout.spec.ts >> sending a follow-up preserves the original request and updates the plan once
- Location: tests\browser\lemonade-layout.spec.ts:270:1

# Error details

```
Error: page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:4319/?project=8cb075b6-2fb9-4ed4-a5f0-3aa14ff06e0a
Call log:
  - navigating to "http://127.0.0.1:4319/?project=8cb075b6-2fb9-4ed4-a5f0-3aa14ff06e0a", waiting until "load"

```

# Test source

```ts
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
  236 |   await plan.locator("li summary").filter({ hasText: "Implement core loop" }).click();
  237 |   await plan
  238 |     .getByRole("button", { name: /ServerScriptService.*Game.server.luau/ })
  239 |     .click();
  240 |   await expect(
  241 |     page.getByRole("dialog", { name: "Source details" }),
  242 |   ).toBeVisible();
  243 |   await page.keyboard.press("Escape");
  244 |   await page.getByRole("button", { name: "History", exact: true }).click();
  245 |   await expect(
  246 |     page.getByRole("heading", { name: "Conversation history" }),
  247 |   ).toBeVisible();
  248 |   await page.keyboard.press("Escape");
  249 |   await page.getByLabel("Message", { exact: true }).focus();
  250 |   await page
  251 |     .getByLabel("Message", { exact: true })
  252 |     .fill("Add a shop with item previews");
  253 |   await expect(page.getByLabel("Message", { exact: true })).toBeFocused();
  254 |   // The inspection and unsent message interactions must not mutate the saved project.
  255 |   const unchanged = await (
  256 |     await page.request.get("/api/projects/" + created.id)
  257 |   ).json();
  258 |   expect(unchanged.revision).toBe(created.revision);
  259 |   expect(unchanged.request).toBe(created.request);
  260 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  261 |   expect(
  262 |     await page.evaluate(
  263 |       () => document.documentElement.scrollWidth <= innerWidth,
  264 |     ),
  265 |   ).toBe(true);
  266 |   await page.screenshot({
  267 |     path: `docs/results/forge-minimal-workspace-${testInfo.project.name}.png`,
  268 |     fullPage: true,
  269 |   });
  270 | });
  271 | 
  272 | test("sending a follow-up preserves the original request and updates the plan once", async ({
  273 |   page,
  274 | }) => {
  275 |   const created = await (
  276 |     await page.request.post("/api/projects", {
  277 |       data: { request: "A cooperative farming game" },
  278 |     })
  279 |   ).json();
  280 |   let plans = 0;
  281 |   await page.route("**/api/projects/" + created.id + "/plan", async (route) => {
  282 |     plans++;
  283 |     const saved = await (
  284 |       await page.request.get("/api/projects/" + created.id)
  285 |     ).json();
  286 |     expect(route.request().postDataJSON().revision).toBe(saved.revision);
  287 |     await route.fulfill({
  288 |       json: { ...saved, spec: specification(saved.request, saved.scope) },
> 289 |     });
      |              ^ Error: page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:4319/?project=8cb075b6-2fb9-4ed4-a5f0-3aa14ff06e0a
  290 |   });
  291 |   await page.goto("/?project=" + created.id);
  292 |   await page
  293 |     .getByLabel("Message", { exact: true })
  294 |     .fill("Add a crop selling shop");
  295 |   await page
  296 |     .getByRole("button", { name: "Send message and update plan" })
  297 |     .click();
  298 |   await expect(page.getByLabel("Project request")).toHaveValue(
  299 |     "A cooperative farming game",
  300 |   );
  301 |   await expect(page.getByLabel("Message", { exact: true })).toBeEmpty();
  302 |   expect(plans).toBe(1);
  303 |   await page.reload();
  304 |   await expect(page.getByLabel("Saved conversation")).toContainText(
  305 |     "Add a crop selling shop",
  306 |   );
  307 | });
  308 | 
```