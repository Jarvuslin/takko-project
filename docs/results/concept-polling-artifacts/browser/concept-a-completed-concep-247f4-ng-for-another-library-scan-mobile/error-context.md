# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: concept.spec.ts >> a completed concept appears without waiting for another library scan
- Location: tests\browser\concept.spec.ts:166:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('navigation', { name: 'Projects', exact: true }).getByRole('button', { name: 'Tiny pet rescue', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('navigation', { name: 'Projects', exact: true }).getByRole('button', { name: 'Tiny pet rescue', exact: true }) with timeout 5000ms
  - waiting for getByRole('navigation', { name: 'Projects', exact: true }).getByRole('button', { name: 'Tiny pet rescue', exact: true })

```

```yaml
- complementary:
  - link "Takko home":
    - /url: /
    - text: takko
  - button "New project"
  - button "Marketplace"
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
- main:
  - text: Workspace/Tiny pet rescue
  - button "Models"
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - option "Tiny pet rescue" [selected]
  - heading "Tiny pet rescue" [level=1]
  - region "Project conversation":
    - strong: Tiny pet rescue
    - text: draft
    - button "History"
    - tablist "Project views":
      - tab "Brief" [selected]
      - tab "Build"
      - tab "Source"
      - tab "Studio"
      - text: $0.0000 / $2.0000
    - heading "Your request" [level=2]
    - text: Revision 1 Project request
    - textbox "Project request": Make a pet rescue game
    - button "Update concept from request"
    - button "Configure models"
    - region "Your game concept":
      - text: YOUR GAME CONCEPT
      - heading "Tiny pet rescue" [level=2]
      - paragraph: Find a lost pet, bring it home, and earn a new trail to explore.
      - paragraph: "Look and feel: A friendly forest with clear paths and bright shelters."
      - group: Suggested defaults · 1
      - heading "First thing to try" [level=3]
      - paragraph: Rescue one pet and see the reward.
      - group: How you’ll check it after building
      - paragraph: This is a proposed direction. Your full request stays in scope.
      - button "Use this concept & plan"
    - group: Build plan · 0 tasks
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - group "Attached assets"
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  106 |   await expect(
  107 |     page.getByText("These have not been verified in Studio.", { exact: false }),
  108 |   ).toBeVisible();
  109 |   expect(calls.filter((c) => c.action === "plan")).toHaveLength(1);
  110 |   expect(
  111 |     await page.evaluate(
  112 |       () => document.documentElement.scrollWidth <= innerWidth,
  113 |     ),
  114 |   ).toBe(true);
  115 | });
  116 | 
  117 | test("custom answers are retained and edited requests cannot use a stale concept", async ({
  118 |   page,
  119 | }) => {
  120 |   const { calls } = await setup(page);
  121 |   await page
  122 |     .getByRole("button", { name: "Shape my idea", exact: true })
  123 |     .click();
  124 |   await page.getByLabel("Your answer").fill("Friends carry pets together");
  125 |   await page
  126 |     .getByRole("button", { name: "Update my concept", exact: true })
  127 |     .click();
  128 |   expect(
  129 |     calls.find((c) => c.action === "project")?.body.answers.play_style,
  130 |   ).toBe("Friends carry pets together");
  131 |   await page
  132 |     .getByLabel("Project request", { exact: true })
  133 |     .fill("Make a cooperative pet rescue game");
  134 |   await expect(
  135 |     page.getByRole("button", { name: "Use this concept & plan" }),
  136 |   ).toBeDisabled();
  137 |   await page
  138 |     .getByRole("button", { name: "Update concept from request", exact: true })
  139 |     .click();
  140 |   await expect(
  141 |     page.getByRole("button", { name: "Use this concept & plan" }),
  142 |   ).toBeEnabled();
  143 |   expect(calls.filter((c) => c.action === "project").at(-1)?.body.request).toBe(
  144 |     "Make a cooperative pet rescue game",
  145 |   );
  146 |   expect(calls.filter((c) => c.action === "plan")).toHaveLength(0);
  147 | });
  148 | 
  149 | test("older running servers retain direct planning without offering an unavailable action", async ({
  150 |   page,
  151 | }) => {
  152 |   await page.route("**/api/status", (route) =>
  153 |     route.fulfill({
  154 |       json: { mode: "multi-model", configured: true, studios: [] },
  155 |     }),
  156 |   );
  157 |   await setup(page);
  158 |   await expect(
  159 |     page.getByRole("button", { name: "Plan this game" }),
  160 |   ).toBeVisible();
  161 |   await expect(
  162 |     page.getByRole("button", { name: "Shape my idea", exact: true }),
  163 |   ).toHaveCount(0);
  164 | });
  165 | 
  166 | test("a completed concept appears without waiting for another library scan", async ({
  167 |   page,
  168 | }) => {
  169 |   const p = await (
  170 |     await page.request.post("/api/projects", {
  171 |       data: { request: "Make a pet rescue game" },
  172 |     })
  173 |   ).json();
  174 |   let reads = 0,
  175 |     listReads = 0;
  176 |   await page.route("**/api/projects", (route) => {
  177 |     listReads++;
  178 |     // A failed sidebar refresh must not hide already completed project work.
  179 |     return listReads > 1
  180 |       ? route.abort()
  181 |       : route.fulfill({
  182 |           json: [{ id: p.id, name: p.name, stage: "planning" }],
  183 |         });
  184 |   });
  185 |   await page.route("**/api/projects/" + p.id, (route) => {
  186 |     reads++;
  187 |     return route.fulfill({
  188 |       json:
  189 |         reads === 1
  190 |           ? { ...p, jobId: p.id, stage: "planning" }
  191 |           : {
  192 |               ...p,
  193 |               name: "Tiny pet rescue",
  194 |               concept: { ...conceptFixture(false), revision: p.revision },
  195 |             },
  196 |     });
  197 |   });
  198 |   await page.goto("/?project=" + p.id);
  199 |   await expect(
  200 |     page.getByRole("button", { name: "Use this concept & plan" }),
  201 |   ).toBeEnabled();
  202 |   await expect(
  203 |     page
  204 |       .getByRole("navigation", { name: "Projects", exact: true })
  205 |       .getByRole("button", { name: "Tiny pet rescue", exact: true }),
> 206 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  207 |   expect(listReads).toBe(1);
  208 |   await expect(page.getByRole("alert")).toHaveCount(0);
  209 | });
  210 | 
```