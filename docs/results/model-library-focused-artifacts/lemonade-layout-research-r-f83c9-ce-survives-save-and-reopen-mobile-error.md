# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lemonade-layout.spec.ts >> research routing preference survives save and reopen
- Location: tests\browser\lemonade-layout.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Edit preset', exact: true }).first()

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
          - paragraph [ref=e25]: Your models. Your team. Your budget.
        - button "Create preset" [ref=e26] [cursor=pointer]
      - tablist "Models workspace" [ref=e29]:
        - tab "Model library 0" [ref=e30] [cursor=pointer]:
          - text: Model library
          - generic [ref=e31]: "0"
        - tab "Presets 1" [selected] [ref=e32] [cursor=pointer]:
          - text: Presets
          - generic [ref=e33]: "1"
      - generic [ref=e35]:
        - generic [ref=e36]: Search presets
        - searchbox "Search presets" [ref=e37]
      - paragraph [ref=e38]: Save different teams for different jobs. Each preset includes its own budget.
      - article [ref=e40]:
        - generic [ref=e41]:
          - generic [aria-hidden] [ref=e42]: 🌮
          - generic [ref=e43]:
            - heading "My first preset" [level=2] [ref=e44]
            - generic [ref=e45]: Active for future work
        - generic [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]: Planner
            - generic [ref=e51]: Not chosen
          - generic [ref=e52]:
            - generic [ref=e53]: Builder
            - generic [ref=e54]: Not chosen
          - generic [ref=e55]:
            - generic [ref=e56]: Reviewer
            - generic [ref=e57]: Not chosen
          - generic [ref=e58]:
            - generic [ref=e59]: Repair
            - generic [ref=e60]: Not chosen
        - generic [ref=e61]:
          - generic [ref=e62]: $2.00 / generation
          - generic [ref=e63]: $2.00 / project
        - generic [ref=e64]:
          - button "Edit My first preset" [ref=e65] [cursor=pointer]: Edit preset
          - button "In use" [disabled] [ref=e66]
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
  10  |   await page
  11  |     .getByRole("button", { name: "Edit My first preset", exact: true })
  12  |     .first()
> 13  |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  14  |   const toggle = page.getByRole("checkbox", {
  15  |     name: "Research before planning",
  16  |   });
  17  |   await toggle.check();
  18  |   await page.getByRole("button", { name: "Save preset", exact: true }).click();
  19  |   await page
  20  |     .getByRole("button", { name: "Edit My first preset", exact: true })
  21  |     .first()
  22  |     .click();
  23  |   await expect(page.getByLabel("research primary")).toBeVisible();
  24  |   await page.keyboard.press("Escape");
  25  |   await page.reload();
  26  |   await page
  27  |     .getByRole("button", { name: "Edit My first preset", exact: true })
  28  |     .first()
  29  |     .click();
  30  |   await expect(toggle).toBeChecked();
  31  |   await page.request.put("/api/models", {
  32  |     data: {
  33  |       ...before,
  34  |       profiles: before.profiles.map(({ hasKey, ...p }: any) => p),
  35  |     },
  36  |   });
  37  | });
  38  | 
  39  | test("shows reference research, uncertainty and source links in the brief", async ({
  40  |   page,
  41  | }) => {
  42  |   const p = await (
  43  |     await page.request.post("/api/projects", {
  44  |       data: { request: "A Steal a Brainrot style game" },
  45  |     })
  46  |   ).json();
  47  |   const fixture = {
  48  |     ...p,
  49  |     spec: specification(p.request, p.scope),
  50  |     research: {
  51  |       referenceGame: "Steal a Brainrot",
  52  |       summary: "Acquire and steal income-producing characters.",
  53  |       retrievedAt: p.createdAt,
  54  |       mechanics: [
  55  |         {
  56  |           id: "steal",
  57  |           importance: "core",
  58  |           description: "Carry a rival's character back to your base",
  59  |           sourceUrls: [
  60  |             "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot",
  61  |           ],
  62  |         },
  63  |       ],
  64  |       unknowns: ["Exact lock timing is unverified"],
  65  |       sources: [
  66  |         {
  67  |           url: "https://www.roblox.com/games/109983668079237/Steal-a-Brainrot",
  68  |           title: "Original Roblox experience",
  69  |           excerpt: "",
  70  |         },
  71  |       ],
  72  |     },
  73  |   };
  74  |   await page.route("**/api/projects/" + p.id, (route) =>
  75  |     route.fulfill({ json: fixture }),
  76  |   );
  77  |   await page.goto("/?project=" + p.id);
  78  |   await expect(
  79  |     page.getByText("Game research · Steal a Brainrot", { exact: true }),
  80  |   ).toBeVisible();
  81  |   await expect(page.getByText("Exact lock timing is unverified")).toBeVisible();
  82  |   await expect(
  83  |     page.getByRole("link", { name: "Original Roblox experience" }),
  84  |   ).toHaveAttribute("href", fixture.research.sources[0].url);
  85  |   expect(
  86  |     await page.evaluate(
  87  |       () => document.documentElement.scrollWidth <= innerWidth,
  88  |     ),
  89  |   ).toBe(true);
  90  | });
  91  | 
  92  | test("shows a concise generation failure with expandable diagnostics", async ({
  93  |   page,
  94  | }) => {
  95  |   const p = await (
  96  |     await page.request.post("/api/projects", {
  97  |       data: { request: "Build a cookie scene" },
  98  |     })
  99  |   ).json();
  100 |   const fixture = {
  101 |     ...p,
  102 |     spec: specification(p.request, p.scope),
  103 |     stage: "failed",
  104 |     error: "Could not complete Cookie scene. Unsupported class CookieShape.",
  105 |     failure: {
  106 |       code: "GENERATION_OUTPUT_REJECTED",
  107 |       phase: "builder",
  108 |       taskId: "coreTask",
  109 |       attempts: 2,
  110 |       details:
  111 |         "Scene node Workspace/Forge_Test/Cookie uses unsupported class CookieShape.",
  112 |       at: p.createdAt,
  113 |     },
```