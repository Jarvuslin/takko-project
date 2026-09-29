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
    - button "Marketplace" [ref=e12] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]: Workspace/Routing
      - button "Models" [ref=e20] [cursor=pointer]
    - region "Workspace settings" [ref=e23]:
      - navigation "Settings pages" [ref=e24]:
        - button "Models" [ref=e25] [cursor=pointer]
        - button "Routing" [ref=e26] [cursor=pointer]
        - button "Budget" [ref=e27] [cursor=pointer]
        - button "Back to project" [ref=e28] [cursor=pointer]
      - generic [ref=e30]:
        - heading "Routing" [level=1] [ref=e31]
        - paragraph [ref=e32]: Choose which model handles each part of a generation.
      - generic [ref=e33]:
        - generic [ref=e34]:
          - strong [ref=e35]: Research before planning
          - paragraph [ref=e36]: Find game references. Research uses the same generation budget.
        - switch "Research before planning" [disabled] [ref=e37]
      - generic [ref=e38]:
        - article [ref=e39]:
          - generic [ref=e40]:
            - strong [ref=e41]: Research
            - generic [ref=e42]: Collect game references
          - generic [ref=e43]: Use planner route
          - generic [ref=e44]: "Fallbacks: None"
          - button "Change Research route" [ref=e45] [cursor=pointer]: Change
        - article [ref=e46]:
          - generic [ref=e47]:
            - strong [ref=e48]: Planner / lead
            - generic [ref=e49]: Turn the idea into a plan
          - generic [ref=e50]: Not configured
          - generic [ref=e51]: "Fallbacks: None"
          - button "Change Planner / lead route" [ref=e52] [cursor=pointer]: Change
        - article [ref=e53]:
          - generic [ref=e54]:
            - strong [ref=e55]: Builder
            - generic [ref=e56]: Write the game
          - generic [ref=e57]: Not configured
          - generic [ref=e58]: "Fallbacks: None"
          - button "Change Builder route" [ref=e59] [cursor=pointer]: Change
        - article [ref=e60]:
          - generic [ref=e61]:
            - strong [ref=e62]: Reviewer
            - generic [ref=e63]: Check the result
          - generic [ref=e64]: Not configured
          - generic [ref=e65]: "Fallbacks: None"
          - button "Change Reviewer route" [ref=e66] [cursor=pointer]: Change
        - article [ref=e67]:
          - generic [ref=e68]:
            - strong [ref=e69]: Repair
            - generic [ref=e70]: Fix issues found in review
          - generic [ref=e71]: Not configured
          - generic [ref=e72]: "Fallbacks: None"
          - button "Change Repair route" [ref=e73] [cursor=pointer]: Change
      - generic [ref=e74]:
        - paragraph [ref=e75]: Each route is saved independently.
        - button "Use one model for all" [ref=e76] [cursor=pointer]
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