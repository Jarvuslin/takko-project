# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> Marketplace supports saved assets, inspected drag/drop and chat attachment context
- Location: tests\browser\marketplace.spec.ts:100:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.dragTo: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('complementary', { name: 'Marketplace' }).getByRole('article')
    - locator resolved to <article draggable="true" class="market-card">…</article>
  - attempting move and down action
    - waiting for element to be visible and stable
    - element is visible and stable
    - scrolling into view if needed
    - done scrolling
    - performing move and down action
    - move and down action done
    - waiting for scheduled navigations to finish
    - navigations have finished
  - waiting for getByLabel('Game idea')
    - locator resolved to <textarea required="" minlength="5" id="new-request" maxlength="12000" placeholder="Describe your game. Start with the fun part.">Make a satisfying butter game</textarea>
  - attempting move and up action
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="market-grid">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
    - retrying move and up action
    - waiting 20ms
    - waiting for element to be visible and stable
    - element is visible and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="market-grid">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
  2 × retrying move and up action
      - waiting 100ms
      - waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="market-connection-row">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
  13 × retrying move and up action
       - waiting 500ms
       - waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="market-grid">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
     - retrying move and up action
       - waiting 500ms
       - waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="market-grid">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
     - retrying move and up action
       - waiting 500ms
       - waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="market-connection-row">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
     - retrying move and up action
       - waiting 500ms
       - waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="market-connection-row">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
  2 × retrying move and up action
      - waiting 500ms
      - waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="market-grid">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
  - retrying move and up action
    - waiting 500ms
    - waiting for element to be visible and stable
    - element is visible and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="market-connection-row">…</div> from <dialog open="" class="focused-dialog" aria-label="Marketplace">…</dialog> subtree intercepts pointer events
  - retrying move and up action
    - waiting 500ms

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
          - generic [ref=e32]: "1001"
        - navigation "Projects" [ref=e33]:
          - button "Build a butter game" [ref=e34] [cursor=pointer]
          - button "Build a butter game" [ref=e36] [cursor=pointer]
          - button "Animation pack preview test" [ref=e38] [cursor=pointer]
          - button "A cooperative farming game" [ref=e40] [cursor=pointer]
          - button "A farming game with a harvest shop" [ref=e42] [cursor=pointer]
          - button "Build a cookie scene" [ref=e44] [cursor=pointer]
          - button "A Steal a Brainrot style game" [ref=e46] [cursor=pointer]
          - button "Animation accessibility test" [ref=e48] [cursor=pointer]
          - button "A combat game" [ref=e50] [cursor=pointer]
          - button "A combat game" [ref=e52] [cursor=pointer]
          - button "An arena with short rounds" [ref=e54] [cursor=pointer]
          - button "A garden for friends to explore" [ref=e56] [cursor=pointer]
          - button "Make a game about a space station" [ref=e58] [cursor=pointer]
          - button "Make a pet rescue game" [ref=e60] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e62] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e64] [cursor=pointer]
          - button "Make a pet rescue game with trading" [ref=e66] [cursor=pointer]
          - button "B icon rail 42b8dfe0-9572-4cea-8dc5-bbc90b99357d" [ref=e68] [cursor=pointer]
          - button "Arena architecture dock regression" [ref=e70] [cursor=pointer]
          - button "Asset execution UI regression" [ref=e72] [cursor=pointer]
          - button "A punch animation preview" [ref=e74] [cursor=pointer]
          - button "A cooperative garden game" [ref=e76] [cursor=pointer]
          - button "A combat game with energy" [ref=e78] [cursor=pointer]
          - button "Orchard" [ref=e80] [cursor=pointer]
          - button "Make a farming loop with crop growth, harvesting, selling and a" [ref=e82] [cursor=pointer]
          - button "A small puzzle game" [ref=e84] [cursor=pointer]
          - button "A cooperative farming game with a harvest shop" [ref=e86] [cursor=pointer]
          - button "A Studio recovery fixture" [ref=e88] [cursor=pointer]
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
          - button "B icon rail 9e482440-bab2-44cf-91c3-601b198f0cd8" [ref=e126] [cursor=pointer]
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
          - button "A castle puzzle adventure" [ref=e148] [cursor=pointer]
          - button "A polling fixture game" [ref=e150] [cursor=pointer]
          - button "Build a butter game" [ref=e152] [cursor=pointer]
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
        - group "Attached assets"
        - generic [ref=e178]:
          - button "Browse Marketplace assets" [ref=e179] [cursor=pointer]:
            - generic [ref=e182]: Marketplace
          - button "Presets" [ref=e183] [cursor=pointer]
          - button "Budget for this generation" [ref=e186] [cursor=pointer]: Budget
          - button "Create project" [ref=e187] [cursor=pointer]
      - generic "Starting points" [ref=e191]:
        - button "Build an obby" [disabled] [ref=e192]
        - button "Make an arena" [disabled] [ref=e195]
        - button "Create a cozy world" [disabled] [ref=e198]
      - region "Recent projects" [ref=e201]:
        - heading "Pick up where you left off" [level=2] [ref=e202]
        - generic [ref=e203]:
          - button "Build a butter game draft" [ref=e204] [cursor=pointer]:
            - strong [ref=e205]: Build a butter game
            - generic [ref=e206]: draft
          - button "Build a butter game draft" [ref=e207] [cursor=pointer]:
            - strong [ref=e208]: Build a butter game
            - generic [ref=e209]: draft
          - button "Animation pack preview test draft" [ref=e210] [cursor=pointer]:
            - strong [ref=e211]: Animation pack preview test
            - generic [ref=e212]: draft
      - paragraph [ref=e213]: Plan it. Build it. Then test it in Studio.
  - dialog "Marketplace" [active] [ref=e214]:
    - banner [ref=e215]:
      - generic [ref=e216]:
        - heading "Marketplace" [level=2] [ref=e217]
        - paragraph [ref=e218]: Discover free Roblox assets for your next idea.
      - button "Close Marketplace" [ref=e219] [cursor=pointer]
    - complementary "Marketplace" [ref=e222]:
      - generic [ref=e223]:
        - generic [ref=e224]:
          - text: Studio
          - combobox "Marketplace Studio" [ref=e225]:
            - option "Select Studio"
            - option "Test Studio" [selected]
        - button "Refresh Studios" [ref=e226] [cursor=pointer]
      - generic "Asset collections" [ref=e227]:
        - button "Search" [ref=e228] [cursor=pointer]
        - button "Library" [ref=e229] [cursor=pointer]
        - button "Liked" [ref=e230] [cursor=pointer]
        - button "Saved" [pressed] [ref=e231] [cursor=pointer]
      - generic [ref=e232]:
        - heading "Saved assets" [level=3] [ref=e233]
        - generic [ref=e234]: 1 assets · Free
      - article [ref=e236]:
        - link "Working Butter" [ref=e240] [cursor=pointer]:
          - /url: https://create.roblox.com/store/asset/123
        - generic [ref=e241]: Test Creator · Model
        - generic [ref=e242]: Not inspected
        - generic [ref=e243]:
          - button "Like Working Butter" [pressed] [ref=e244] [cursor=pointer]
          - button "Save Working Butter" [pressed] [ref=e247] [cursor=pointer]:
            - generic [ref=e250]: Save
          - button "Add" [ref=e251] [cursor=pointer]
      - paragraph [ref=e254]: Add an asset to inspect it and attach it to your brief. Models with animation clips open a preview in your conversation. Static inspection does not verify gameplay or media permissions.
```

# Test source

```ts
  87  |     "Use the updated asset attachments",
  88  |   );
  89  |   await page.reload();
  90  |   await expect(
  91  |     page.getByLabel("Use for Working Butter", { exact: true }),
  92  |   ).toHaveValue("Keep the animation and sound");
  93  |   await page.getByRole("link", { name: "Takko home", exact: true }).click();
  94  |   await expect(page.getByLabel("Game idea")).toBeVisible();
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
  179 |   await card.getByLabel("Like Working Butter", { exact: true }).click();
  180 |   await expect(
  181 |     card.getByLabel("Like Working Butter", { exact: true }),
  182 |   ).toHaveAttribute("aria-pressed", "true");
  183 |   await card.getByLabel("Save Working Butter", { exact: true }).click();
  184 |   await panel.getByRole("button", { name: "Saved", exact: true }).click();
  185 |   await expect(card).toHaveCount(1);
  186 |   if (testInfo.project.name === "desktop") {
> 187 |     await card.dragTo(page.getByLabel("Game idea"));
      |                ^ Error: locator.dragTo: Test timeout of 30000ms exceeded.
  188 |   } else await card.getByRole("button", { name: "Add", exact: true }).click();
  189 |   await expect(page.getByRole("status")).toContainText(
  190 |     "Inspected and attached",
  191 |   );
  192 |   await panel.getByRole("button", { name: "Close Marketplace" }).click();
  193 |   await page
  194 |     .getByLabel("Use for Working Butter", { exact: true })
  195 |     .fill("Preserve its animation and sound");
  196 |   const accessibility = await new AxeBuilder({ page }).analyze();
  197 |   expect(accessibility.violations).toEqual([]);
  198 |   await page
  199 |     .getByRole("button", { name: "Create project", exact: true })
  200 |     .click();
  201 |   await expect
  202 |     .poll(() => submitted?.assetAttachments?.[0]?.usage)
  203 |     .toBe("Preserve its animation and sound");
  204 |   expect(submitted.assetAttachments[0].assetId).toBe("123");
  205 |   expect(submitted.assetAttachments[0].contentHash).toBe("a".repeat(64));
  206 |   await page.getByRole("button", { name: "Remove Working Butter" }).click();
  207 |   await page
  208 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  209 |     .click();
  210 |   await panel.getByRole("button", { name: "Saved", exact: true }).click();
  211 |   await card.getByRole("button", { name: "Add", exact: true }).click();
  212 |   await expect(page.getByRole("status")).toContainText("cached inspection");
  213 |   expect(
  214 |     await page.evaluate(
  215 |       () => document.documentElement.scrollWidth <= innerWidth,
  216 |     ),
  217 |   ).toBe(true);
  218 | });
  219 | 
  220 | test("blocked first drops display findings and never become chat attachments", async ({
  221 |   page,
  222 | }) => {
  223 |   await page.route("**/api/marketplace/studios", (r) =>
  224 |     r.fulfill({
  225 |       json: {
  226 |         studios: [
  227 |           { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
  228 |         ],
  229 |       },
  230 |     }),
  231 |   );
  232 |   await page.route("**/api/marketplace/inspect", (r) =>
  233 |     r.fulfill({
  234 |       json: {
  235 |         cacheHit: false,
  236 |         asset: {
  237 |           assetId: "123",
  238 |           name: "Suspicious model",
  239 |           inspection: {
  240 |             status: "blocked",
  241 |             findings: [
  242 |               {
  243 |                 rule: "dynamic-code",
  244 |                 message: "Dynamic code execution or environment manipulation.",
  245 |               },
  246 |             ],
  247 |           },
  248 |         },
  249 |       },
  250 |     }),
  251 |   );
  252 |   await page.goto("/");
  253 |   await page
  254 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  255 |     .click();
  256 |   await expect(page.getByLabel("Marketplace Studio")).not.toHaveValue("");
  257 |   await page.getByRole("button", { name: "Close Marketplace" }).click();
  258 |   const data = await page.evaluateHandle(() => {
  259 |     const d = new DataTransfer();
  260 |     d.setData("text/uri-list", "https://create.roblox.com/store/asset/123");
  261 |     return d;
  262 |   });
  263 |   await page
  264 |     .getByLabel("Game idea")
  265 |     .dispatchEvent("drop", { dataTransfer: data });
  266 |   await expect(page.getByRole("status")).toContainText("was not attached");
  267 |   await expect(
  268 |     page.getByText("Dynamic code execution or environment manipulation."),
  269 |   ).toBeVisible();
  270 |   await expect(
  271 |     page.getByRole("button", { name: "Remove Suspicious model" }),
  272 |   ).toHaveCount(0);
  273 | });
  274 | 
```