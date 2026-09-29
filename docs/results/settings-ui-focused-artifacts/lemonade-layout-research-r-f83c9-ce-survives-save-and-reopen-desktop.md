# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lemonade-layout.spec.ts >> research routing preference survives save and reopen
- Location: tests\browser\lemonade-layout.spec.ts:5:1

# Error details

```
Error: locator.check: Clicking the checkbox did not change its state
Call log:
  - waiting for getByRole('switch', { name: 'Research before planning' })
    - locator resolved to <input role="switch" type="checkbox" aria-label="Research before planning"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - generic [ref=e12]:
      - generic [ref=e13]: Search projects
      - searchbox "Search projects" [ref=e14]
    - button "Marketplace" [ref=e15] [cursor=pointer]
    - navigation "Workspace" [ref=e19]:
      - button "Models" [ref=e20] [cursor=pointer]
      - button "Routing" [ref=e24] [cursor=pointer]
      - button "Budget" [ref=e28] [cursor=pointer]
    - generic [ref=e32]:
      - text: Recent projects
      - generic [ref=e33]: "0"
    - navigation "Projects" [ref=e34]:
      - paragraph [ref=e35]: Your projects will appear here.
    - generic [ref=e36]:
      - link "Download plugin" [ref=e37] [cursor=pointer]:
        - /url: /api/studio/plugin
      - generic [ref=e43]: Local workspace
  - main [ref=e45]:
    - generic [ref=e46]:
      - generic [ref=e47]: Workspace/Routing
      - generic [ref=e48]:
        - generic "Create or open a project to set up Studio" [ref=e49]: Studio not connected
        - button "Models" [ref=e51] [cursor=pointer]
    - region "Workspace settings" [ref=e54]:
      - generic [ref=e56]:
        - heading "Routing" [level=1] [ref=e57]
        - paragraph [ref=e58]: Choose which model handles each part of a generation.
      - generic [ref=e59]:
        - generic [ref=e60]:
          - strong [ref=e61]: Research before planning
          - paragraph [ref=e62]: Find game references. Research uses the same generation budget.
        - switch "Research before planning" [disabled] [ref=e63]
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]: Stage
          - generic [ref=e67]: Primary model
          - generic [ref=e68]: Fallbacks
        - article [ref=e69]:
          - generic [ref=e70]:
            - strong [ref=e71]: Research
            - generic [ref=e72]: Collect game references
          - generic [ref=e73]: Use planner route
          - generic [ref=e74]: None
          - button "Change Research route" [ref=e75] [cursor=pointer]: Change
        - article [ref=e76]:
          - generic [ref=e77]:
            - strong [ref=e78]: Planner / lead
            - generic [ref=e79]: Turn the idea into a plan
          - generic [ref=e80]: Not configured
          - generic [ref=e81]: None
          - button "Change Planner / lead route" [ref=e82] [cursor=pointer]: Change
        - article [ref=e83]:
          - generic [ref=e84]:
            - strong [ref=e85]: Builder
            - generic [ref=e86]: Write the game
          - generic [ref=e87]: Not configured
          - generic [ref=e88]: None
          - button "Change Builder route" [ref=e89] [cursor=pointer]: Change
        - article [ref=e90]:
          - generic [ref=e91]:
            - strong [ref=e92]: Reviewer
            - generic [ref=e93]: Check the result
          - generic [ref=e94]: Not configured
          - generic [ref=e95]: None
          - button "Change Reviewer route" [ref=e96] [cursor=pointer]: Change
        - article [ref=e97]:
          - generic [ref=e98]:
            - strong [ref=e99]: Repair
            - generic [ref=e100]: Fix issues found in review
          - generic [ref=e101]: Not configured
          - generic [ref=e102]: None
          - button "Change Repair route" [ref=e103] [cursor=pointer]: Change
      - generic [ref=e104]:
        - paragraph [ref=e105]: Each route is saved independently.
        - button "Use one model for all" [ref=e106] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { profile, specification } from "../generation-fixtures";
  4   | 
  5   | test("research routing preference survives save and reopen", async ({
  6   |   page,
  7   | }) => {
  8   |   const before = await (await page.request.get("/api/models")).json();
  9   |   await page.goto("/#routing");
  10  |   const toggle = page.getByRole("switch", { name: "Research before planning" });
> 11  |   await toggle.check();
      |                ^ Error: locator.check: Clicking the checkbox did not change its state
  12  |   await expect(page.getByRole("status")).toHaveText("Saved");
  13  |   await page
  14  |     .getByRole("button", { name: "Change Research route", exact: true })
  15  |     .click();
  16  |   await expect(page.getByLabel("research primary")).toBeVisible();
  17  |   await page.keyboard.press("Escape");
  18  |   await page.reload();
  19  |   await expect(toggle).toBeChecked();
  20  |   await page.request.put("/api/models", {
  21  |     data: {
  22  |       ...before,
  23  |       profiles: before.profiles.map(({ hasKey, ...p }: any) => p),
  24  |     },
  25  |   });
  26  | });
  27  | 
  28  | test("shows reference research, uncertainty and source links in the brief", async ({
  29  |   page,
  30  | }) => {
  31  |   const p = await (
  32  |     await page.request.post("/api/projects", {
  33  |       data: { request: "A Steal a Brainrot style game" },
  34  |     })
  35  |   ).json();
  36  |   const fixture = {
  37  |     ...p,
  38  |     spec: specification(p.request, p.scope),
  39  |     research: {
  40  |       referenceGame: "Steal a Brainrot",
  41  |       summary: "Acquire and steal income-producing characters.",
  42  |       retrievedAt: p.createdAt,
  43  |       mechanics: [
  44  |         {
  45  |           id: "steal",
  46  |           importance: "core",
  47  |           description: "Carry a rival's character back to your base",
  48  |           sourceUrls: [
  49  |             "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot",
  50  |           ],
  51  |         },
  52  |       ],
  53  |       unknowns: ["Exact lock timing is unverified"],
  54  |       sources: [
  55  |         {
  56  |           url: "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot",
  57  |           title: "Original Roblox experience",
  58  |           excerpt: "",
  59  |         },
  60  |       ],
  61  |     },
  62  |   };
  63  |   await page.route("**/api/projects/" + p.id, (route) =>
  64  |     route.fulfill({ json: fixture }),
  65  |   );
  66  |   await page.goto("/?project=" + p.id);
  67  |   await expect(
  68  |     page.getByText("Game research · Steal a Brainrot", { exact: true }),
  69  |   ).toBeVisible();
  70  |   await expect(page.getByText("Exact lock timing is unverified")).toBeVisible();
  71  |   await expect(
  72  |     page.getByRole("link", { name: "Original Roblox experience" }),
  73  |   ).toHaveAttribute("href", fixture.research.sources[0].url);
  74  |   expect(
  75  |     await page.evaluate(
  76  |       () => document.documentElement.scrollWidth <= innerWidth,
  77  |     ),
  78  |   ).toBe(true);
  79  | });
  80  | 
  81  | test("shows a concise generation failure with expandable diagnostics", async ({
  82  |   page,
  83  | }) => {
  84  |   const p = await (
  85  |     await page.request.post("/api/projects", {
  86  |       data: { request: "Build a cookie scene" },
  87  |     })
  88  |   ).json();
  89  |   const fixture = {
  90  |     ...p,
  91  |     spec: specification(p.request, p.scope),
  92  |     stage: "failed",
  93  |     error: "Could not complete Cookie scene. Unsupported class CookieShape.",
  94  |     failure: {
  95  |       code: "GENERATION_OUTPUT_REJECTED",
  96  |       phase: "builder",
  97  |       taskId: "coreTask",
  98  |       attempts: 2,
  99  |       details:
  100 |         "Scene node Workspace/Forge_Test/Cookie uses unsupported class CookieShape.",
  101 |       at: p.createdAt,
  102 |     },
  103 |   };
  104 |   await page.route("**/api/projects/" + p.id, (route) =>
  105 |     route.fulfill({ json: fixture }),
  106 |   );
  107 |   await page.goto("/?project=" + p.id);
  108 |   const alert = page.getByRole("alert");
  109 |   await expect(alert).toContainText("Could not complete Cookie scene");
  110 |   await alert.getByText("Generation diagnostics", { exact: true }).click();
  111 |   await expect(alert.locator("pre")).toBeVisible();
```