# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> Models and Presets pages and dialogs pass accessibility and keep actions visible
- Location: tests\browser\settings-workspace.spec.ts:337:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 134

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1a1c1a",
+               "contrastRatio": 4.39,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#7e827e",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.39 (foreground color: #7e827e, background color: #1a1c1a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"provider-connection is-locked\">",
+                 "target": Array [
+                   ".dialog-body > .provider-connection.is-locked",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.39 (foreground color: #7e827e, background color: #1a1c1a, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<small>Add your provider key once. Validate it to unlock the model catalog.</small>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".dialog-body > .provider-connection.is-locked > .connection-copy > div > small:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1a1c1a",
+               "contrastRatio": 3.79,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#727872",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.79 (foreground color: #727872, background color: #1a1c1a, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"provider-connection is-locked\">",
+                 "target": Array [
+                   ".dialog-body > .provider-connection.is-locked",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.79 (foreground color: #727872, background color: #1a1c1a, font size: 8.3pt (11px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<small>Saved encrypted on this PC, protected by your Windows account.</small>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".dialog-body > .provider-connection.is-locked > .connection-copy > div > small:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#181816",
+               "contrastRatio": 3.89,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#767672",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.89 (foreground color: #767672, background color: #181816, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<dialog class=\"focused-dialog\" data-modal=\"true\" data-scroll-body=\"false\" aria-label=\"Add model\" open=\"\">",
+                 "target": Array [
+                   "dialog",
+                 ],
+               },
+               Object {
+                 "html": "<main>",
+                 "target": Array [
+                   "main",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.89 (foreground color: #767672, background color: #181816, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<small>The catalog loads automatically</small>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".dialog-body > .provider-catalog[aria-label=\"OpenRouter model catalog\"] > .catalog-heading > div > small",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
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
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [ref=e13] [cursor=pointer]
    - navigation "Workspace" [ref=e17]:
      - button "Models" [ref=e18] [cursor=pointer]
      - button "Presets" [ref=e22] [cursor=pointer]
    - group
  - main [ref=e26]:
    - generic [ref=e27]:
      - generic [ref=e28]: Workspace/Models
      - button "Back to project" [ref=e30] [cursor=pointer]
    - generic [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]:
          - heading "Models" [level=1] [ref=e34]
          - paragraph [ref=e35]: Manage your model library and discover new models. Add models from your providers and use them in any preset.
        - button "Add model" [ref=e36] [cursor=pointer]
      - region "Saved models" [ref=e39]:
        - generic [ref=e40]:
          - heading "Saved models 3" [level=2] [ref=e41]:
            - text: Saved models
            - generic [ref=e42]: "3"
          - paragraph [ref=e43]: Models you've added to your library. Use them in any preset.
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]: Search models
            - searchbox "Search models" [ref=e47]
          - combobox "Filter saved models by provider" [ref=e48]:
            - option "All providers" [selected]
            - option "OpenRouter"
            - option "OpenAI"
            - option "Anthropic"
            - option "Google Gemini"
            - option "Other / local"
        - generic [ref=e49]:
          - article [ref=e50]:
            - generic [ref=e54]:
              - strong [ref=e55]: Everyday
              - generic [ref=e56]: Other / local · fixture
              - generic [ref=e57]: $1.00 read · $2.00 write / 1M tokens
            - generic [ref=e59]:
              - generic [ref=e60]: Connection
              - text: Needs API key
            - button "Test connection for Everyday" [disabled] [ref=e61]: Test
            - button "Edit Everyday" [ref=e64] [cursor=pointer]: Edit
          - article [ref=e65]:
            - generic [ref=e69]:
              - strong [ref=e70]: Fast builder
              - generic [ref=e71]: Other / local · fixture
              - generic [ref=e72]: $1.00 read · $2.00 write / 1M tokens
            - generic [ref=e74]:
              - generic [ref=e75]: Connection
              - text: Needs API key
            - button "Test connection for Fast builder" [disabled] [ref=e76]: Test
            - button "Edit Fast builder" [ref=e79] [cursor=pointer]: Edit
          - article [ref=e80]:
            - generic [ref=e84]:
              - strong [ref=e85]: Reviewer
              - generic [ref=e86]: Other / local · fixture
              - generic [ref=e87]: $1.00 read · $2.00 write / 1M tokens
            - generic [ref=e89]:
              - generic [ref=e90]: Connection
              - text: Needs API key
            - button "Test connection for Reviewer" [disabled] [ref=e91]: Test
            - button "Edit Reviewer" [ref=e94] [cursor=pointer]: Edit
      - region "Explore providers" [ref=e95]:
        - heading "Explore providers" [level=2] [ref=e96]
        - paragraph [ref=e97]: One connection, every model. Choose a provider to discover what's available.
        - group "Provider" [ref=e98]:
          - button "OpenRouter" [pressed] [ref=e99] [cursor=pointer]
          - button "OpenAI" [ref=e102] [cursor=pointer]
          - button "Anthropic" [ref=e105] [cursor=pointer]
          - button "Google Gemini" [ref=e108] [cursor=pointer]
          - button "Other / local" [ref=e111] [cursor=pointer]
        - generic [ref=e116]:
          - generic [ref=e121]:
            - strong [ref=e122]: Connect OpenRouter
            - generic [ref=e123]: Add your provider key once. Validate it to unlock the model catalog.
            - generic [ref=e124]: Saved encrypted on this PC, protected by your Windows account.
          - generic [ref=e125]:
            - generic [ref=e126]:
              - text: API key
              - textbox "API key" [ref=e127]:
                - /placeholder: Paste your provider API key
            - button "Validate & connect" [disabled] [ref=e128]
        - region "OpenRouter model catalog" [ref=e129]:
          - generic [ref=e130]:
            - generic [ref=e131]: The catalog loads automatically
            - button "Refresh model catalog" [disabled] [ref=e133]: Refresh
          - status [ref=e136]: Connect this provider to browse its models. Your key is shared by every model you add from this provider.
  - dialog "Add model" [ref=e137]:
    - banner [ref=e138]:
      - generic [ref=e139]:
        - heading "Add model" [level=2] [ref=e140]
        - paragraph [ref=e141]: Choose a model for your library. Use it in any preset.
      - button "Close dialog" [active] [ref=e142] [cursor=pointer]
    - generic [ref=e145]:
      - generic [ref=e146]:
        - heading "Provider" [level=3] [ref=e147]
        - group "Provider" [ref=e148]:
          - button "OpenRouter" [pressed] [ref=e149] [cursor=pointer]
          - button "OpenAI" [ref=e152] [cursor=pointer]
          - button "Anthropic" [ref=e155] [cursor=pointer]
          - button "Google Gemini" [ref=e158] [cursor=pointer]
          - button "Other / local" [ref=e161] [cursor=pointer]
        - generic [ref=e166]:
          - generic [ref=e171]:
            - strong [ref=e172]: Connect OpenRouter
            - generic [ref=e173]: Add your provider key once. Validate it to unlock the model catalog.
            - generic [ref=e174]: Saved encrypted on this PC, protected by your Windows account.
          - generic [ref=e175]:
            - generic [ref=e176]:
              - text: API key
              - textbox "API key" [ref=e177]:
                - /placeholder: Paste your provider API key
            - button "Validate & connect" [disabled] [ref=e178]
        - heading "Model" [level=3] [ref=e179]
        - region "OpenRouter model catalog" [ref=e180]:
          - generic [ref=e181]:
            - generic [ref=e182]:
              - strong [ref=e183]: Available from OpenRouter
              - generic [ref=e184]: The catalog loads automatically
            - button "Refresh model catalog" [disabled] [ref=e185]: Refresh
          - status [ref=e188]: Connect this provider to browse its models. Your key is shared by every model you add from this provider.
        - button "Can't find it? Enter a model ID" [disabled] [ref=e189]
        - group [ref=e190]:
          - generic "Usage cost · price unavailable" [ref=e191] [cursor=pointer]
        - group [ref=e192]:
          - generic "Advanced Optional · defaults work for most models" [ref=e193] [cursor=pointer]:
            - text: Advanced
            - generic [ref=e194]: Optional · defaults work for most models
          - option "Short · 4,096 tokens"
          - option "Standard · 8,192 tokens" [selected]
          - option "Long · 16,384 tokens"
          - option "Extra long · 32,768 tokens"
          - option "Automatic" [selected]
          - option "Low · more room for the answer"
          - option "Medium"
          - option "High"
      - contentinfo [ref=e195]:
        - button "Cancel" [ref=e196] [cursor=pointer]
        - button "Add to library" [disabled] [ref=e197]
```

# Test source

```ts
  267 |   await dialog.getByRole("button", { name: "Anthropic", exact: true }).click();
  268 |   await expect(
  269 |     dialog.getByText(
  270 |       "Connect this provider to browse its models. Your key is shared by every model you add from this provider.",
  271 |     ),
  272 |   ).toBeVisible();
  273 |   await expect(
  274 |     dialog.getByRole("button", { name: /Example model.*openai/ }),
  275 |   ).toHaveCount(0);
  276 |   await dialog
  277 |     .getByRole("button", { name: "Other / local", exact: true })
  278 |     .click();
  279 |   await dialog
  280 |     .getByLabel("Provider endpoint")
  281 |     .fill(settings.profiles[0].baseUrl);
  282 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  283 |   await expect(dialog.getByText(/A key is already available/)).toBeVisible();
  284 | });
  285 | 
  286 | test("strict concept opt-in is saved for Anthropic and cleared when switching models", async ({
  287 |   page,
  288 | }) => {
  289 |   await page.route("**/api/model-catalog", (route) =>
  290 |     route.fulfill({
  291 |       json: [
  292 |         {
  293 |           id: "anthropic/claude-haiku-4.5",
  294 |           name: "Haiku test",
  295 |           inputRate: 1,
  296 |           outputRate: 5,
  297 |         },
  298 |       ],
  299 |     }),
  300 |   );
  301 |   await page.goto("/#models");
  302 |   await connectFixture(page);
  303 |   await page
  304 |     .getByRole("button", { name: /Haiku test.*anthropic\/claude-haiku/ })
  305 |     .click();
  306 |   const dialog = page.getByRole("dialog");
  307 |   await dialog.locator("summary").filter({ hasText: "Advanced" }).click();
  308 |   await dialog
  309 |     .getByLabel("Check concept response structure", { exact: true })
  310 |     .check();
  311 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  312 |   await expect(dialog).toBeHidden();
  313 |   let settings = await (await page.request.get("/api/models")).json();
  314 |   const saved = settings.profiles.find(
  315 |     (p: any) => p.model === "anthropic/claude-haiku-4.5",
  316 |   );
  317 |   expect(saved.structuredOutput).toBe("anthropic");
  318 |   await page.reload();
  319 |   await page
  320 |     .getByRole("searchbox", { name: "Search models" })
  321 |     .fill("Haiku test");
  322 |   await page
  323 |     .locator(".model-row")
  324 |     .getByRole("button", { name: /Edit/ })
  325 |     .click();
  326 |   await dialog
  327 |     .getByRole("button", { name: "Edit model details", exact: true })
  328 |     .click();
  329 |   await dialog.getByLabel("Model ID", { exact: true }).fill("openai/example");
  330 |   await dialog.getByRole("button", { name: "Save model", exact: true }).click();
  331 |   await expect(dialog).toBeHidden();
  332 |   settings = await (await page.request.get("/api/models")).json();
  333 |   expect(
  334 |     settings.profiles.find((p: any) => p.id === saved.id).structuredOutput,
  335 |   ).toBeUndefined();
  336 | });
  337 | test("Models and Presets pages and dialogs pass accessibility and keep actions visible", async ({
  338 |   page,
  339 | }, info) => {
  340 |   for (const route of ["models", "presets"]) {
  341 |     await page.goto("/#" + route);
  342 |     await expect(
  343 |       page.getByRole("heading", {
  344 |         name: route === "models" ? "Models" : "Presets",
  345 |         exact: true,
  346 |       }),
  347 |     ).toBeVisible();
  348 |     expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  349 |     expect(
  350 |       await page.evaluate(
  351 |         () => document.documentElement.scrollWidth <= innerWidth,
  352 |       ),
  353 |     ).toBe(true);
  354 |     await page.screenshot({
  355 |       path: `docs/results/model-library-${route}-${info.project.name}.png`,
  356 |       fullPage: true,
  357 |     });
  358 |     await page
  359 |       .getByRole("button", {
  360 |         name: route === "models" ? "Add model" : "Create preset",
  361 |         exact: true,
  362 |       })
  363 |       .click();
  364 |     const dialog = page.getByRole("dialog");
  365 |     expect(
  366 |       (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
> 367 |     ).toEqual([]);
      |       ^ Error: expect(received).toEqual(expected) // deep equality
  368 |     const box = await dialog
  369 |       .getByRole("button", {
  370 |         name: route === "models" ? "Add to library" : "Save preset",
  371 |       })
  372 |       .boundingBox();
  373 |     expect(box!.y + box!.height).toBeLessThanOrEqual(
  374 |       page.viewportSize()!.height,
  375 |     );
  376 |     await page.screenshot({
  377 |       path: `docs/results/model-library-${route}-dialog-${info.project.name}.png`,
  378 |     });
  379 |     await page.keyboard.press("Escape");
  380 |   }
  381 | });
  382 | test("project-specific preset route survives refresh", async ({ page }) => {
  383 |   const p = await (
  384 |     await page.request.post("/api/projects", {
  385 |       data: { request: "A castle puzzle adventure" },
  386 |     })
  387 |   ).json();
  388 |   await page.goto("/?project=" + p.id + "#presets");
  389 |   await page.reload();
  390 |   await expect(page).toHaveURL(new RegExp(p.id + "#presets"));
  391 |   await expect(
  392 |     page
  393 |       .getByRole("navigation", { name: "Workspace" })
  394 |       .getByRole("button", { name: "Presets", exact: true }),
  395 |   ).toHaveAttribute("aria-current", "page");
  396 | });
  397 | 
  398 | test("Presets is a separate sidebar page directly below Models", async ({
  399 |   page,
  400 | }) => {
  401 |   await page.goto("/#models");
  402 |   const nav = page.getByRole("navigation", { name: "Workspace" });
  403 |   await expect(nav.getByRole("button")).toHaveText(["Models", "Presets"]);
  404 |   await expect(
  405 |     page.getByRole("tablist", { name: "Models workspace" }),
  406 |   ).toHaveCount(0);
  407 |   await page
  408 |     .getByRole("searchbox", { name: "Search models" })
  409 |     .fill("A model search");
  410 |   await nav.getByRole("button", { name: "Presets", exact: true }).click();
  411 |   await expect(page).toHaveURL(/#presets$/);
  412 |   await expect(
  413 |     page.getByRole("heading", { name: "Presets", exact: true }),
  414 |   ).toBeVisible();
  415 |   await expect(
  416 |     page.getByRole("searchbox", { name: "Search presets" }),
  417 |   ).toHaveValue("");
  418 |   await expect(
  419 |     nav.getByRole("button", { name: "Presets", exact: true }),
  420 |   ).toHaveAttribute("aria-current", "page");
  421 |   await expect(
  422 |     nav.getByRole("button", { name: "Models", exact: true }),
  423 |   ).not.toHaveAttribute("aria-current", "page");
  424 |   await page.goBack();
  425 |   await expect(
  426 |     page.getByRole("heading", { name: "Models", exact: true }),
  427 |   ).toBeVisible();
  428 |   await page.goto("/#routing");
  429 |   await expect(
  430 |     page.getByRole("heading", { name: "Presets", exact: true }),
  431 |   ).toBeVisible();
  432 | });
  433 | 
  434 | test.afterEach(async ({ page }) => {
  435 |   await page.unrouteAll({ behavior: "ignoreErrors" });
  436 | });
  437 | 
```