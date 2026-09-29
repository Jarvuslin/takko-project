# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: concept.spec.ts >> a completed concept appears without waiting for another library scan
- Location: tests\browser\concept.spec.ts:169:1

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
  - button "New project"
  - button "Marketplace"
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
  - group: Projects
  - link "Download plugin":
    - /url: /api/studio/plugin
- main:
  - text: Workspace/Tiny pet rescue
  - button "Connect to Studio"
  - button "Models"
  - region "Game architecture":
    - text: Your game, connected
    - strong: Game architecture
    - text: draft · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - img "System connections"
    - paragraph: Add your first system, such as Combat, Inventory or Quests. Connect an event to the behavior it should trigger.
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - heading "Tiny pet rescue" [level=1]
  - region "Project conversation":
    - strong: Takko
    - text: draft
    - button "Latest ↓"
    - button "History"
    - text: $0.0000 / $2.0000
    - article:
      - strong: You
      - text: Revision 1 · 12:10 PM
      - paragraph: Make a pet rescue game
    - group: Preview an animation clip
    - region "Studio in conversation"
    - group: Edit original brief
    - button "Update concept from request"
    - button "Configure models"
    - region "Your game concept":
      - text: YOUR GAME CONCEPT
      - heading "Tiny pet rescue" [level=2]
      - paragraph: Find a lost pet, bring it home, and earn a new trail to explore.
      - paragraph: "Look and feel: A friendly forest with clear paths and bright shelters."
      - group:
        - text: Choices to review
        - list:
          - listitem:
            - strong: "Game loop:"
            - text: Find pets and bring them to a shelter to open trails. · Proposed interpretation, review before accepting
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
  117 | });
  118 | 
  119 | test("custom answers are retained and edited requests cannot use a stale concept", async ({
  120 |   page,
  121 | }) => {
  122 |   const { calls } = await setup(page);
  123 |   await page
  124 |     .getByRole("button", { name: "Shape my idea", exact: true })
  125 |     .click();
  126 |   await page.getByLabel("Your answer").fill("Friends carry pets together");
  127 |   await page
  128 |     .getByRole("button", { name: "Update my concept", exact: true })
  129 |     .click();
  130 |   expect(
  131 |     calls.find((c) => c.action === "project")?.body.answers.play_style,
  132 |   ).toBe("Friends carry pets together");
  133 |   await page.getByText("Edit original brief", { exact: true }).click();
  134 |   await page
  135 |     .getByLabel("Project request", { exact: true })
  136 |     .fill("Make a cooperative pet rescue game");
  137 |   await expect(
  138 |     page.getByRole("button", { name: "Use this concept & plan" }),
  139 |   ).toBeDisabled();
  140 |   await page
  141 |     .getByRole("button", { name: "Update concept from request", exact: true })
  142 |     .click();
  143 |   await expect(
  144 |     page.getByRole("button", { name: "Use this concept & plan" }),
  145 |   ).toBeEnabled();
  146 |   expect(calls.filter((c) => c.action === "project").at(-1)?.body.request).toBe(
  147 |     "Make a cooperative pet rescue game",
  148 |   );
  149 |   expect(calls.filter((c) => c.action === "plan")).toHaveLength(0);
  150 | });
  151 | 
  152 | test("older running servers retain direct planning without offering an unavailable action", async ({
  153 |   page,
  154 | }) => {
  155 |   await page.route("**/api/status", (route) =>
  156 |     route.fulfill({
  157 |       json: { mode: "multi-model", configured: true, studios: [] },
  158 |     }),
  159 |   );
  160 |   await setup(page);
  161 |   await expect(
  162 |     page.getByRole("button", { name: "Plan this game" }),
  163 |   ).toBeVisible();
  164 |   await expect(
  165 |     page.getByRole("button", { name: "Shape my idea", exact: true }),
  166 |   ).toHaveCount(0);
  167 | });
  168 | 
  169 | test("a completed concept appears without waiting for another library scan", async ({
  170 |   page,
  171 |   isMobile,
  172 | }) => {
  173 |   const p = await (
  174 |     await page.request.post("/api/projects", {
  175 |       data: { request: "Make a pet rescue game" },
  176 |     })
  177 |   ).json();
  178 |   let reads = 0,
  179 |     listReads = 0;
  180 |   await page.route("**/api/projects", (route) => {
  181 |     listReads++;
  182 |     // A failed sidebar refresh must not hide already completed project work.
  183 |     return listReads > 1
  184 |       ? route.abort()
  185 |       : route.fulfill({
  186 |           json: [{ id: p.id, name: p.name, stage: "planning" }],
  187 |         });
  188 |   });
  189 |   await page.route("**/api/projects/" + p.id, (route) => {
  190 |     reads++;
  191 |     return route.fulfill({
  192 |       json:
  193 |         reads === 1
  194 |           ? { ...p, jobId: p.id, stage: "planning" }
  195 |           : {
  196 |               ...p,
  197 |               name: "Tiny pet rescue",
  198 |               concept: assessConcept(conceptProposalFixture(false), p),
  199 |             },
  200 |     });
  201 |   });
  202 |   await page.goto("/?project=" + p.id);
  203 |   await expect(
  204 |     page.getByRole("button", { name: "Use this concept & plan" }),
  205 |   ).toBeEnabled();
  206 |   if (isMobile)
  207 |     await expect(
  208 |       page
  209 |         .getByRole("combobox", { name: "Open project" })
  210 |         .locator("option:checked"),
  211 |     ).toHaveText("Tiny pet rescue");
  212 |   else
  213 |     await expect(
  214 |       page
  215 |         .getByRole("navigation", { name: "Projects", exact: true })
  216 |         .getByRole("button", { name: "Tiny pet rescue", exact: true }),
> 217 |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  218 |   expect(listReads).toBe(1);
  219 |   await expect(page.getByRole("alert")).toHaveCount(0);
  220 | });
  221 | 
  222 | test("legacy and unresolved concepts remain inspectable without a planning action", async ({
  223 |   page,
  224 | }) => {
  225 |   const p = await (
  226 |     await page.request.post("/api/projects", {
  227 |       data: { request: "Make a game about a space station" },
  228 |     })
  229 |   ).json();
  230 |   let unresolved = false;
  231 |   await page.route("**/api/projects/" + p.id, (route) =>
  232 |     route.fulfill({
  233 |       json: {
  234 |         ...p,
  235 |         concept: unresolved
  236 |           ? assessConcept(
  237 |               {
  238 |                 ...conceptProposalFixture(false),
  239 |                 unresolvedIssues: [
  240 |                   "Choose whether the station focuses on trading or exploration.",
  241 |                 ],
  242 |               },
  243 |               p,
  244 |             )
  245 |           : { ...conceptFixture(false), revision: p.revision },
  246 |       },
  247 |     }),
  248 |   );
  249 |   await page.goto("/?project=" + p.id);
  250 |   await expect(
  251 |     page.getByText("This saved concept needs an update before planning."),
  252 |   ).toBeVisible();
  253 |   await expect(
  254 |     page.getByRole("button", { name: "Use this concept & plan" }),
  255 |   ).toHaveCount(0);
  256 |   await expect(
  257 |     page.getByRole("button", { name: "Update my concept", exact: true }),
  258 |   ).toBeEnabled();
  259 |   unresolved = true;
  260 |   await page.reload();
  261 |   await expect(
  262 |     page.getByText(
  263 |       "Choose whether the station focuses on trading or exploration.",
  264 |     ),
  265 |   ).toBeVisible();
  266 |   await expect(
  267 |     page.getByText("Choices to review", { exact: true }),
  268 |   ).toBeVisible();
  269 |   await expect(
  270 |     page.getByRole("button", { name: "Use this concept & plan" }),
  271 |   ).toHaveCount(0);
  272 | });
  273 | 
```