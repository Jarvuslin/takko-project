# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> Presets is a separate sidebar page directly below Models
- Location: tests\browser\settings-workspace.spec.ts:263:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByRole('navigation', { name: 'Workspace' }).getByRole('button')
Timeout: 5000ms
- Expected  - 4
+ Received  + 1

- Array [
-   "Models",
-   "Presets",
- ]
+ Array []

Call log:
  - Expect "toHaveText" getByRole('navigation', { name: 'Workspace' }).getByRole('button') with timeout 5000ms
  - waiting for getByRole('navigation', { name: 'Workspace' }).getByRole('button')
    14 × locator resolved to 0 elements

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
          - paragraph [ref=e25]: Your model library, all in one place.
        - button "Add model" [ref=e26] [cursor=pointer]
      - generic [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]: Search models
          - searchbox "Search models" [ref=e32]
        - button "Browse providers" [ref=e33] [cursor=pointer]
      - generic [ref=e36]:
        - article [ref=e37]:
          - generic [ref=e41]:
            - strong [ref=e42]: Everyday
            - generic [ref=e43]: Other / local · fixture
          - generic [ref=e44]: Needs API key
          - button "Edit Everyday" [ref=e45] [cursor=pointer]: Edit
        - article [ref=e46]:
          - generic [ref=e50]:
            - strong [ref=e51]: Fast builder
            - generic [ref=e52]: Other / local · fixture
          - generic [ref=e53]: Needs API key
          - button "Edit Fast builder" [ref=e54] [cursor=pointer]: Edit
        - article [ref=e55]:
          - generic [ref=e59]:
            - strong [ref=e60]: Reviewer
            - generic [ref=e61]: Other / local · fixture
          - generic [ref=e62]: Needs API key
          - button "Edit Reviewer" [ref=e63] [cursor=pointer]: Edit
```

# Test source

```ts
  168 |         .evaluate((img: HTMLImageElement) => img.naturalWidth),
  169 |     )
  170 |     .toBeGreaterThan(0);
  171 | });
  172 | test("provider change clears catalog and matching credentials are reused", async ({
  173 |   page,
  174 | }) => {
  175 |   const settings = await (await page.request.get("/api/models")).json();
  176 |   await page.request.put("/api/models/" + settings.profiles[0].id + "/key", {
  177 |     data: { key: "fixture-only-key" },
  178 |   });
  179 |   await page.goto("/#models");
  180 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  181 |   const dialog = page.getByRole("dialog");
  182 |   await dialog.getByRole("button", { name: "Anthropic", exact: true }).click();
  183 |   await expect(
  184 |     dialog.getByText(
  185 |       "Enter your provider API key to load its available models.",
  186 |     ),
  187 |   ).toBeVisible();
  188 |   await expect(
  189 |     dialog.getByRole("button", { name: /Example model.*openai/ }),
  190 |   ).toHaveCount(0);
  191 |   await dialog
  192 |     .getByRole("button", { name: "Other / local", exact: true })
  193 |     .click();
  194 |   await dialog
  195 |     .getByLabel("Provider endpoint")
  196 |     .fill(settings.profiles[0].baseUrl);
  197 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  198 |   await expect(
  199 |     dialog.getByText(/No need to enter the key again/),
  200 |   ).toBeVisible();
  201 | });
  202 | test("Models and Presets pages and dialogs pass accessibility and keep actions visible", async ({
  203 |   page,
  204 | }, info) => {
  205 |   for (const route of ["models", "presets"]) {
  206 |     await page.goto("/#" + route);
  207 |     await expect(
  208 |       page.getByRole("heading", {
  209 |         name: route === "models" ? "Models" : "Presets",
  210 |         exact: true,
  211 |       }),
  212 |     ).toBeVisible();
  213 |     expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  214 |     expect(
  215 |       await page.evaluate(
  216 |         () => document.documentElement.scrollWidth <= innerWidth,
  217 |       ),
  218 |     ).toBe(true);
  219 |     await page.screenshot({
  220 |       path: `docs/results/model-library-${route}-${info.project.name}.png`,
  221 |       fullPage: true,
  222 |     });
  223 |     await page
  224 |       .getByRole("button", {
  225 |         name: route === "models" ? "Add model" : "Create preset",
  226 |         exact: true,
  227 |       })
  228 |       .click();
  229 |     const dialog = page.getByRole("dialog");
  230 |     expect(
  231 |       (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
  232 |     ).toEqual([]);
  233 |     const box = await dialog
  234 |       .getByRole("button", {
  235 |         name: route === "models" ? "Add to library" : "Save preset",
  236 |       })
  237 |       .boundingBox();
  238 |     expect(box!.y + box!.height).toBeLessThanOrEqual(
  239 |       page.viewportSize()!.height,
  240 |     );
  241 |     await page.screenshot({
  242 |       path: `docs/results/model-library-${route}-dialog-${info.project.name}.png`,
  243 |     });
  244 |     await page.keyboard.press("Escape");
  245 |   }
  246 | });
  247 | test("project-specific preset route survives refresh", async ({ page }) => {
  248 |   const p = await (
  249 |     await page.request.post("/api/projects", {
  250 |       data: { request: "A castle puzzle adventure" },
  251 |     })
  252 |   ).json();
  253 |   await page.goto("/?project=" + p.id + "#presets");
  254 |   await page.reload();
  255 |   await expect(page).toHaveURL(new RegExp(p.id + "#presets"));
  256 |   await expect(
  257 |     page
  258 |       .getByRole("navigation", { name: "Workspace" })
  259 |       .getByRole("button", { name: "Presets", exact: true }),
  260 |   ).toHaveAttribute("aria-current", "page");
  261 | });
  262 | 
  263 | test("Presets is a separate sidebar page directly below Models", async ({
  264 |   page,
  265 | }) => {
  266 |   await page.goto("/#models");
  267 |   const nav = page.getByRole("navigation", { name: "Workspace" });
> 268 |   await expect(nav.getByRole("button")).toHaveText(["Models", "Presets"]);
      |                                         ^ Error: expect(locator).toHaveText(expected) failed
  269 |   await expect(
  270 |     page.getByRole("tablist", { name: "Models workspace" }),
  271 |   ).toHaveCount(0);
  272 |   await page
  273 |     .getByRole("searchbox", { name: "Search models" })
  274 |     .fill("A model search");
  275 |   await nav.getByRole("button", { name: "Presets", exact: true }).click();
  276 |   await expect(page).toHaveURL(/#presets$/);
  277 |   await expect(
  278 |     page.getByRole("heading", { name: "Presets", exact: true }),
  279 |   ).toBeVisible();
  280 |   await expect(
  281 |     page.getByRole("searchbox", { name: "Search presets" }),
  282 |   ).toHaveValue("");
  283 |   await expect(
  284 |     nav.getByRole("button", { name: "Presets", exact: true }),
  285 |   ).toHaveAttribute("aria-current", "page");
  286 |   await expect(
  287 |     nav.getByRole("button", { name: "Models", exact: true }),
  288 |   ).not.toHaveAttribute("aria-current", "page");
  289 |   await page.goBack();
  290 |   await expect(
  291 |     page.getByRole("heading", { name: "Models", exact: true }),
  292 |   ).toBeVisible();
  293 |   await page.goto("/#routing");
  294 |   await expect(
  295 |     page.getByRole("heading", { name: "Presets", exact: true }),
  296 |   ).toBeVisible();
  297 | });
  298 | 
```