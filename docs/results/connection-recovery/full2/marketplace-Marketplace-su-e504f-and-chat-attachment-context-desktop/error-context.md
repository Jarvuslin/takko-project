# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> Marketplace supports saved assets, inspected drag/drop and chat attachment context
- Location: tests\browser\marketplace.spec.ts:100:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "Inspected and attached"
Error: strict mode violation: getByRole('status') resolved to 2 elements:
    1) <p role="status" class="asset-status">Inspected and attached. No issues found by static…</p> aka getByText('Inspected and attached. No')
    2) <p role="status" data-connected="true" class="marketplace-connection-status">…</p> aka getByRole('dialog', { name: 'Marketplace' }).getByRole('status')

Call log:
  - Expect "toContainText" getByRole('status') with timeout 5000ms
  - waiting for getByRole('status')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [expanded] [ref=e13] [cursor=pointer]
    - navigation "Workspace" [ref=e17]:
      - button "Models" [ref=e18] [cursor=pointer]
      - button "Presets" [ref=e22] [cursor=pointer]
    - group [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: Search projects
          - searchbox "Search projects" [ref=e30]
        - generic [ref=e31]:
          - text: Recent projects
          - generic [ref=e32]: "1271"
        - navigation "Projects" [ref=e33]:
          - button "Build a butter game" [ref=e34] [cursor=pointer]
          - button "Animation pack preview test" [ref=e36] [cursor=pointer]
          - button "A cooperative farming game" [ref=e38] [cursor=pointer]
          - button "A farming game with a harvest shop" [ref=e40] [cursor=pointer]
          - button "Build a cookie scene" [ref=e42] [cursor=pointer]
          - button "A Steal a Brainrot style game" [ref=e44] [cursor=pointer]
          - button "Animation accessibility test" [ref=e46] [cursor=pointer]
          - button "A combat game" [ref=e48] [cursor=pointer]
          - button "A combat game" [ref=e50] [cursor=pointer]
          - button "An arena with short rounds" [ref=e52] [cursor=pointer]
          - button "A garden for friends to explore" [ref=e54] [cursor=pointer]
          - button "Make a game about a space station" [ref=e56] [cursor=pointer]
          - button "Make a pet rescue game" [ref=e58] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e60] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e62] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e64] [cursor=pointer]
          - button "B icon rail 69311f34-a6a3-4f96-b443-cd8294eae766" [ref=e66] [cursor=pointer]
          - button "Arena architecture dock regression" [ref=e68] [cursor=pointer]
          - button "Asset execution UI regression" [ref=e70] [cursor=pointer]
          - button "A punch animation preview" [ref=e72] [cursor=pointer]
          - button "A cooperative garden game" [ref=e74] [cursor=pointer]
          - button "A combat game with energy" [ref=e76] [cursor=pointer]
          - button "Orchard" [ref=e78] [cursor=pointer]
          - button "Make a farming loop with crop growth, harvesting, selling and a" [ref=e80] [cursor=pointer]
          - button "A small puzzle game" [ref=e82] [cursor=pointer]
          - button "A cooperative farming game with a harvest shop" [ref=e84] [cursor=pointer]
          - button "A Studio recovery fixture" [ref=e86] [cursor=pointer]
          - button "A quiet forest game" [ref=e88] [cursor=pointer]
          - button "A castle puzzle adventure" [ref=e90] [cursor=pointer]
          - button "A polling fixture game" [ref=e92] [cursor=pointer]
          - button "Build a butter game" [ref=e94] [cursor=pointer]
          - button "Animation pack preview test" [ref=e96] [cursor=pointer]
          - button "A cooperative farming game" [ref=e98] [cursor=pointer]
          - button "A farming game with a harvest shop" [ref=e100] [cursor=pointer]
          - button "Build a cookie scene" [ref=e102] [cursor=pointer]
          - button "A Steal a Brainrot style game" [ref=e104] [cursor=pointer]
          - button "Animation accessibility test" [ref=e106] [cursor=pointer]
          - button "A combat game" [ref=e108] [cursor=pointer]
          - button "A combat game" [ref=e110] [cursor=pointer]
          - button "An arena with short rounds" [ref=e112] [cursor=pointer]
          - button "A garden for friends to explore" [ref=e114] [cursor=pointer]
          - button "Make a game about a space station" [ref=e116] [cursor=pointer]
          - button "Make a pet rescue game" [ref=e118] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e120] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e122] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e124] [cursor=pointer]
          - button "B icon rail 961a0707-41dd-406c-9d46-f90f5a655cad" [ref=e126] [cursor=pointer]
          - button "Arena architecture dock regression" [ref=e128] [cursor=pointer]
          - button "Asset execution UI regression" [ref=e130] [cursor=pointer]
          - button "A punch animation preview" [ref=e132] [cursor=pointer]
          - button "A cooperative garden game" [ref=e134] [cursor=pointer]
          - button "A combat game with energy" [ref=e136] [cursor=pointer]
          - button "Orchard" [ref=e138] [cursor=pointer]
          - button "Make a farming loop with crop growth, harvesting, selling and a" [ref=e140] [cursor=pointer]
          - button "A small puzzle game" [ref=e142] [cursor=pointer]
          - button "A cooperative farming game with a harvest shop" [ref=e144] [cursor=pointer]
          - button "A Studio recovery fixture" [ref=e146] [cursor=pointer]
          - button "A quiet forest game" [ref=e148] [cursor=pointer]
          - button "A castle puzzle adventure" [ref=e150] [cursor=pointer]
          - button "A polling fixture game" [ref=e152] [cursor=pointer]
          - button "Show more projects" [ref=e154] [cursor=pointer]
    - generic [ref=e155]:
      - link "Download plugin" [ref=e156] [cursor=pointer]:
        - /url: /api/studio/plugin
      - generic [ref=e162]: Local workspace
  - main [ref=e164]:
    - generic [ref=e165]:
      - generic [ref=e166]: Workspace/New project
      - button "Models" [ref=e168] [cursor=pointer]
    - generic [ref=e171]:
      - heading "What do you want to build?" [level=1] [ref=e173]
      - paragraph [ref=e174]: Your next Roblox game starts with an idea.
      - generic [ref=e175]:
        - generic [ref=e176]: Game idea
        - textbox "Game idea" [ref=e177]:
          - /placeholder: Describe your game. Start with the fun part.
          - text: Make a satisfying butter game
        - group "Attached assets" [ref=e178]:
          - paragraph [ref=e179]: Selected assets · tell the AI what to keep or change
          - generic [ref=e180]:
            - generic [ref=e181]:
              - strong [ref=e182]: Working Butter
              - generic [ref=e183]: "#123 · inspected"
            - button "Remove Working Butter" [ref=e184] [cursor=pointer]
            - textbox "Use for Working Butter" [ref=e187]:
              - /placeholder: Use for… preserve its animations, change its controls…
          - status [ref=e188]: Inspected and attached. No issues found by static checks.
        - generic [ref=e189]:
          - button "Browse Marketplace assets" [ref=e190] [cursor=pointer]:
            - generic [ref=e193]: Marketplace
          - button "Presets" [ref=e194] [cursor=pointer]
          - button "Budget for this generation" [ref=e197] [cursor=pointer]: Budget
          - button "Create project" [ref=e198] [cursor=pointer]
      - generic "Starting points" [ref=e202]:
        - button "Build an obby" [disabled] [ref=e203]
        - button "Make an arena" [disabled] [ref=e206]
        - button "Create a cozy world" [disabled] [ref=e209]
      - region "Recent projects" [ref=e212]:
        - heading "Pick up where you left off" [level=2] [ref=e213]
        - generic [ref=e214]:
          - button "Build a butter game draft" [ref=e215] [cursor=pointer]:
            - strong [ref=e216]: Build a butter game
            - generic [ref=e217]: draft
          - button "Animation pack preview test draft" [ref=e218] [cursor=pointer]:
            - strong [ref=e219]: Animation pack preview test
            - generic [ref=e220]: draft
          - button "A cooperative farming game draft" [ref=e221] [cursor=pointer]:
            - strong [ref=e222]: A cooperative farming game
            - generic [ref=e223]: draft
      - paragraph [ref=e224]: Plan it. Build it. Then test it in Studio.
  - dialog "Marketplace" [active] [ref=e225]:
    - banner [ref=e226]:
      - generic [ref=e227]:
        - heading "Marketplace" [level=2] [ref=e228]
        - paragraph [ref=e229]: Discover free Roblox assets for your next idea.
      - button "Close Marketplace" [ref=e230] [cursor=pointer]
    - complementary "Marketplace" [ref=e234]:
      - region "Studio connection" [ref=e235]:
        - status [ref=e236]:
          - strong [ref=e238]: Studio connected
        - generic [ref=e239]:
          - generic [ref=e240]:
            - text: Studio
            - combobox "Marketplace Studio" [ref=e241]:
              - option "Select Studio"
              - option "Test Studio" [selected]
          - button "Refresh connection" [ref=e242] [cursor=pointer]
      - generic "Asset collections" [ref=e243]:
        - button "Search" [ref=e244] [cursor=pointer]
        - button "Library" [ref=e245] [cursor=pointer]
        - button "Liked" [ref=e246] [cursor=pointer]
        - button "Saved" [pressed] [ref=e247] [cursor=pointer]
      - generic [ref=e248]:
        - heading "Saved assets" [level=3] [ref=e249]
        - generic [ref=e250]: 1 asset
      - article [ref=e252]:
        - link "Working Butter" [ref=e256] [cursor=pointer]:
          - /url: https://create.roblox.com/store/asset/123
        - generic [ref=e257]: Test Creator · Model
        - generic [ref=e258]: Ratings unavailable
        - generic [ref=e259]: "#123"
        - generic [ref=e260]: Inspected snapshot
        - generic [ref=e261]:
          - button "Like Working Butter" [pressed] [ref=e262] [cursor=pointer]
          - button "Save Working Butter" [pressed] [ref=e265] [cursor=pointer]:
            - generic [ref=e268]: Save
          - button "Add" [ref=e269] [cursor=pointer]
      - paragraph [ref=e272]: Add an asset to inspect it and attach it to your brief. Models with animation clips open a preview in your conversation. Static inspection does not verify gameplay or media permissions.
```

# Test source

```ts
  95  |   await expect(
  96  |     page.getByLabel("Use for Working Butter", { exact: true }),
  97  |   ).toHaveCount(0);
  98  | });
  99  | 
  100 | test("Marketplace supports saved assets, inspected drag/drop and chat attachment context", async ({
  101 |   page,
  102 | }, testInfo) => {
  103 |   const asset: any = {
  104 |     assetId: "123",
  105 |     name: "Working Butter",
  106 |     kind: "Model",
  107 |     creatorName: "Test Creator",
  108 |     updated: "2026-09-16",
  109 |     versionId: "456",
  110 |     liked: false,
  111 |     saved: false,
  112 |   };
  113 |   let inspections = 0,
  114 |     submitted: any;
  115 |   await page.route("**/api/marketplace/**", async (route) => {
  116 |     const url = new URL(route.request().url()),
  117 |       body =
  118 |         route.request().method() === "GET"
  119 |           ? {}
  120 |           : route.request().postDataJSON();
  121 |     let result: any = {};
  122 |     if (url.pathname.endsWith("/studios"))
  123 |       result = {
  124 |         studios: [
  125 |           { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
  126 |         ],
  127 |       };
  128 |     else if (url.pathname.endsWith("/search")) result = { assets: [asset] };
  129 |     else if (url.pathname.endsWith("/inspect")) {
  130 |       inspections++;
  131 |       asset.inspection = {
  132 |         scannerVersion: 1,
  133 |         contentHash: "a".repeat(64),
  134 |         inspectedAt: new Date().toISOString(),
  135 |         status: "no_issues_found",
  136 |         findings: [],
  137 |         scriptCount: 1,
  138 |         nodeCount: 2,
  139 |       };
  140 |       result = { asset, cacheHit: inspections > 1 };
  141 |     } else if (url.pathname.endsWith("/library/123")) {
  142 |       Object.assign(asset, body);
  143 |       result = asset;
  144 |     } else if (url.pathname.endsWith("/library"))
  145 |       result = {
  146 |         assets: [asset].filter(
  147 |           (a) =>
  148 |             url.searchParams.get("filter") === "all" ||
  149 |             a[url.searchParams.get("filter")!],
  150 |         ),
  151 |       };
  152 |     await route.fulfill({ json: result });
  153 |   });
  154 |   await page.route("**/api/projects", async (route) => {
  155 |     if (route.request().method() !== "POST") return route.continue();
  156 |     submitted = route.request().postDataJSON();
  157 |     await route.fulfill({
  158 |       status: 400,
  159 |       json: {
  160 |         error: "Offline browser fixture: submitted attachment captured.",
  161 |       },
  162 |     });
  163 |   });
  164 |   await page.goto("/");
  165 |   await page.getByLabel("Game idea").fill("Make a satisfying butter game");
  166 |   await page
  167 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  168 |     .click();
  169 |   const panel = page.getByRole("complementary", { name: "Marketplace" });
  170 |   await expect(panel.getByLabel("Marketplace Studio")).toHaveValue(
  171 |     "392fce6b-fea7-4de3-bb2e-49a95231c3f5",
  172 |   );
  173 |   await panel.getByLabel("Search Marketplace", { exact: true }).fill("butter");
  174 |   await panel
  175 |     .getByRole("button", { name: "Search assets", exact: true })
  176 |     .click();
  177 |   const card = panel.getByRole("article");
  178 |   await expect(card.getByRole("link")).toHaveText("Working Butter");
  179 |   await panel.getByRole("button", { name: "Animations", exact: true }).click();
  180 |   await expect(panel.getByLabel("Asset type")).toHaveValue("Animation");
  181 |   await page.screenshot({
  182 |     path: `docs/results/asset-choices/marketplace-${testInfo.project.name}.png`,
  183 |   });
  184 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  185 |   await card.getByLabel("Like Working Butter", { exact: true }).click();
  186 |   await expect(
  187 |     card.getByLabel("Like Working Butter", { exact: true }),
  188 |   ).toHaveAttribute("aria-pressed", "true");
  189 |   await card.getByLabel("Save Working Butter", { exact: true }).click();
  190 |   await panel.getByRole("button", { name: "Saved", exact: true }).click();
  191 |   await expect(card).toHaveCount(1);
  192 |   if (testInfo.project.name === "desktop") {
  193 |     await card.dragTo(page.getByLabel("Game idea"));
  194 |   } else await card.getByRole("button", { name: "Add", exact: true }).click();
> 195 |   await expect(page.getByRole("status")).toContainText(
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  196 |     "Inspected and attached",
  197 |   );
  198 |   await page.getByRole("button", { name: "Close Marketplace" }).click();
  199 |   await page
  200 |     .getByLabel("Use for Working Butter", { exact: true })
  201 |     .fill("Preserve its animation and sound");
  202 |   const accessibility = await new AxeBuilder({ page }).analyze();
  203 |   expect(accessibility.violations).toEqual([]);
  204 |   await page
  205 |     .getByRole("button", { name: "Create project", exact: true })
  206 |     .click();
  207 |   await expect
  208 |     .poll(() => submitted?.assetAttachments?.[0]?.usage)
  209 |     .toBe("Preserve its animation and sound");
  210 |   expect(submitted.assetAttachments[0].assetId).toBe("123");
  211 |   expect(submitted.assetAttachments[0].contentHash).toBe("a".repeat(64));
  212 |   await page.getByRole("button", { name: "Remove Working Butter" }).click();
  213 |   await page
  214 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  215 |     .click();
  216 |   await panel.getByRole("button", { name: "Saved", exact: true }).click();
  217 |   await card.getByRole("button", { name: "Add", exact: true }).click();
  218 |   await expect(page.getByRole("status")).toContainText("cached inspection");
  219 |   expect(
  220 |     await page.evaluate(
  221 |       () => document.documentElement.scrollWidth <= innerWidth,
  222 |     ),
  223 |   ).toBe(true);
  224 | });
  225 | 
  226 | test("blocked first drops display findings and never become chat attachments", async ({
  227 |   page,
  228 | }) => {
  229 |   await page.route("**/api/marketplace/studios", (r) =>
  230 |     r.fulfill({
  231 |       json: {
  232 |         studios: [
  233 |           { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
  234 |         ],
  235 |       },
  236 |     }),
  237 |   );
  238 |   await page.route("**/api/marketplace/inspect", (r) =>
  239 |     r.fulfill({
  240 |       json: {
  241 |         cacheHit: false,
  242 |         asset: {
  243 |           assetId: "123",
  244 |           name: "Suspicious model",
  245 |           inspection: {
  246 |             status: "blocked",
  247 |             findings: [
  248 |               {
  249 |                 rule: "dynamic-code",
  250 |                 message: "Dynamic code execution or environment manipulation.",
  251 |               },
  252 |             ],
  253 |           },
  254 |         },
  255 |       },
  256 |     }),
  257 |   );
  258 |   await page.goto("/");
  259 |   await page
  260 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  261 |     .click();
  262 |   await expect(page.getByLabel("Marketplace Studio")).not.toHaveValue("");
  263 |   await page.getByRole("button", { name: "Close Marketplace" }).click();
  264 |   const data = await page.evaluateHandle(() => {
  265 |     const d = new DataTransfer();
  266 |     d.setData("text/uri-list", "https://create.roblox.com/store/asset/123");
  267 |     return d;
  268 |   });
  269 |   await page
  270 |     .getByLabel("Game idea")
  271 |     .dispatchEvent("drop", { dataTransfer: data });
  272 |   await expect(page.getByRole("status")).toContainText("was not attached");
  273 |   await expect(
  274 |     page.getByText("Dynamic code execution or environment manipulation."),
  275 |   ).toBeVisible();
  276 |   await expect(
  277 |     page.getByRole("button", { name: "Remove Suspicious model" }),
  278 |   ).toHaveCount(0);
  279 | });
  280 | 
```