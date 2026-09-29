# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> strict concept opt-in is saved for Anthropic and cleared when switching models
- Location: tests\browser\settings-workspace.spec.ts:222:1

# Error details

```
TypeError: Cannot read properties of undefined (reading 'structuredOutput')
```

# Test source

```ts
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
  180 |   await expect(page.locator(".model-row")).toHaveCount(1);
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
> 256 |   expect(saved.structuredOutput).toBe("anthropic");
      |                ^ TypeError: Cannot read properties of undefined (reading 'structuredOutput')
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
  281 |         exact: true,
  282 |       }),
  283 |     ).toBeVisible();
  284 |     expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  285 |     expect(
  286 |       await page.evaluate(
  287 |         () => document.documentElement.scrollWidth <= innerWidth,
  288 |       ),
  289 |     ).toBe(true);
  290 |     await page.screenshot({
  291 |       path: `docs/results/model-library-${route}-${info.project.name}.png`,
  292 |       fullPage: true,
  293 |     });
  294 |     await page
  295 |       .getByRole("button", {
  296 |         name: route === "models" ? "Add model" : "Create preset",
  297 |         exact: true,
  298 |       })
  299 |       .click();
  300 |     const dialog = page.getByRole("dialog");
  301 |     expect(
  302 |       (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  303 |     ).toEqual([]);
  304 |     const box = await dialog
  305 |       .getByRole("button", {
  306 |         name: route === "models" ? "Add to library" : "Save preset",
  307 |       })
  308 |       .boundingBox();
  309 |     expect(box!.y + box!.height).toBeLessThanOrEqual(
  310 |       page.viewportSize()!.height,
  311 |     );
  312 |     await page.screenshot({
  313 |       path: `docs/results/model-library-${route}-dialog-${info.project.name}.png`,
  314 |     });
  315 |     await page.keyboard.press("Escape");
  316 |   }
  317 | });
  318 | test("project-specific preset route survives refresh", async ({ page }) => {
  319 |   const p = await (
  320 |     await page.request.post("/api/projects", {
  321 |       data: { request: "A castle puzzle adventure" },
  322 |     })
  323 |   ).json();
  324 |   await page.goto("/?project=" + p.id + "#presets");
  325 |   await page.reload();
  326 |   await expect(page).toHaveURL(new RegExp(p.id + "#presets"));
  327 |   await expect(
  328 |     page
  329 |       .getByRole("navigation", { name: "Workspace" })
  330 |       .getByRole("button", { name: "Presets", exact: true }),
  331 |   ).toHaveAttribute("aria-current", "page");
  332 | });
  333 | 
  334 | test("Presets is a separate sidebar page directly below Models", async ({
  335 |   page,
  336 | }) => {
  337 |   await page.goto("/#models");
  338 |   const nav = page.getByRole("navigation", { name: "Workspace" });
  339 |   await expect(nav.getByRole("button")).toHaveText(["Models", "Presets"]);
  340 |   await expect(
  341 |     page.getByRole("tablist", { name: "Models workspace" }),
  342 |   ).toHaveCount(0);
  343 |   await page
  344 |     .getByRole("searchbox", { name: "Search models" })
  345 |     .fill("A model search");
  346 |   await nav.getByRole("button", { name: "Presets", exact: true }).click();
  347 |   await expect(page).toHaveURL(/#presets$/);
  348 |   await expect(
  349 |     page.getByRole("heading", { name: "Presets", exact: true }),
  350 |   ).toBeVisible();
  351 |   await expect(
  352 |     page.getByRole("searchbox", { name: "Search presets" }),
  353 |   ).toHaveValue("");
  354 |   await expect(
  355 |     nav.getByRole("button", { name: "Presets", exact: true }),
  356 |   ).toHaveAttribute("aria-current", "page");
```