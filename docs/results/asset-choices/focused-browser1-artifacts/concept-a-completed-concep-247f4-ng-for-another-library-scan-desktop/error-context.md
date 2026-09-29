# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: concept.spec.ts >> a completed concept appears without waiting for another library scan
- Location: tests\browser\concept.spec.ts:171:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('alert')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
    - button "New project" [ref=e8] [cursor=pointer]
    - button "Marketplace" [ref=e12] [cursor=pointer]
    - navigation "Workspace" [ref=e16]:
      - button "Models" [ref=e17] [cursor=pointer]
      - button "Presets" [ref=e21] [cursor=pointer]
    - group [ref=e25]:
      - generic "Projects" [active] [ref=e26] [cursor=pointer]
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: Search projects
          - searchbox "Search projects" [ref=e33]
        - generic [ref=e34]:
          - text: Recent projects
          - generic [ref=e35]: "1"
        - navigation "Projects" [ref=e36]:
          - button "Tiny pet rescue" [ref=e37] [cursor=pointer]
    - link "Download plugin" [ref=e40] [cursor=pointer]:
      - /url: /api/studio/plugin
  - main [ref=e44]:
    - generic [ref=e45]:
      - generic [ref=e46]: Workspace/Tiny pet rescue
      - generic [ref=e47]:
        - button "Connect to Studio" [ref=e48] [cursor=pointer]
        - button "Models" [ref=e50] [cursor=pointer]
    - generic [ref=e53]:
      - region "Game architecture" [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e57]: Your game, connected
            - strong [ref=e58]: Game architecture
            - generic [ref=e59]: draft · Game architecture
          - generic [ref=e60]:
            - button "Build details" [ref=e61] [cursor=pointer]: Build
            - button "Source details" [ref=e62] [cursor=pointer]: Source
            - button "Studio details" [ref=e63] [cursor=pointer]: Studio
        - generic [ref=e64]:
          - generic [ref=e65]: 0 systems · 0 connections
          - button "Connections" [ref=e66] [cursor=pointer]
          - button "Add system" [ref=e67] [cursor=pointer]
        - generic "Architecture canvas" [ref=e68]:
          - generic [ref=e69]:
            - strong [ref=e70]: Start with your first game system
            - paragraph [ref=e71]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=e72] [cursor=pointer]
            - generic [ref=e73]: Combat · Inventory · Quests
          - generic [ref=e74]:
            - img "System connections"
        - generic "Canvas controls" [ref=e75]:
          - button "Zoom out canvas" [ref=e76] [cursor=pointer]: −
          - generic [ref=e77]: 100%
          - button "Zoom in canvas" [ref=e78] [cursor=pointer]: +
          - button "Fit" [ref=e79] [cursor=pointer]
          - button "Auto layout" [ref=e80] [cursor=pointer]
      - separator "Resize Takko panel" [ref=e81]
      - heading "Tiny pet rescue" [level=1] [ref=e82]
      - region "Project conversation" [ref=e83]:
        - generic [ref=e84]:
          - strong [ref=e86]: Takko
          - generic [ref=e87]: draft
          - button "Latest ↓" [ref=e88] [cursor=pointer]
          - button "History" [ref=e89] [cursor=pointer]
        - generic [ref=e92]:
          - generic [ref=e93]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e95]:
            - article [ref=e96]:
              - generic [ref=e97]:
                - strong [ref=e98]: You
                - generic [ref=e99]: r1 · 05:41 PM
              - paragraph [ref=e100]: Make a pet rescue game
          - group [ref=e101]:
            - generic "Preview an animation clip" [ref=e102] [cursor=pointer]
          - generic [ref=e103]:
            - generic [ref=e104]:
              - region "Studio in conversation"
              - group [ref=e105]:
                - generic "Edit original brief" [ref=e106] [cursor=pointer]
              - region "Your game concept" [ref=e107]:
                - heading "Tiny pet rescue" [level=2] [ref=e108]
                - paragraph [ref=e109]: Find a lost pet, bring it home, and earn a new trail to explore.
                - paragraph [ref=e110]: "Look and feel: A friendly forest with clear paths and bright shelters."
                - group [ref=e111]:
                  - generic "Choices to review" [ref=e112] [cursor=pointer]
                - group [ref=e113]:
                  - generic "Suggested defaults · 1" [ref=e114] [cursor=pointer]
                - generic [ref=e115]:
                  - heading "First thing to try" [level=3] [ref=e116]
                  - paragraph [ref=e117]: Rescue one pet and see the reward.
                  - group [ref=e118]:
                    - generic "How you’ll check it after building" [ref=e119] [cursor=pointer]
                - paragraph [ref=e120]: This is a proposed direction. Your full request stays in scope.
                - button "Approve brief" [ref=e122] [cursor=pointer]
              - region "Assets for your brief" [ref=e123]:
                - generic [ref=e124]:
                  - text: ASSETS FOR YOUR BRIEF
                  - heading "Find your game’s look and movement" [level=3] [ref=e125]
                - paragraph [ref=e126]: Takko searches the free Creator Store using your brief. Nothing is inserted yet.
                - alert [ref=e127]: Connect Roblox Studio to find free Creator Store options for this brief.
                - button "Preview & choose assets" [ref=e129] [cursor=pointer]
            - paragraph [ref=e130]: Your build plan appears after planning.
        - generic [ref=e131]:
          - generic [ref=e132]: Message
          - textbox "Message" [ref=e133]:
            - /placeholder: What would you like to add or change?
          - generic [ref=e134]:
            - button "Browse Marketplace assets" [ref=e135] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e138] [cursor=pointer]
            - button "Presets" [ref=e141] [cursor=pointer]
            - button "Budget for this generation" [ref=e144] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e145]
          - generic [ref=e148]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  123 |   const { calls } = await setup(page);
  124 |   await page
  125 |     .getByRole("button", { name: "Shape my idea", exact: true })
  126 |     .click();
  127 |   await page.getByRole("button", { name: "Other…", exact: true }).click();
  128 |   await page.getByLabel("Your answer").fill("Friends carry pets together");
  129 |   await page
  130 |     .getByRole("button", { name: "Update my concept", exact: true })
  131 |     .click();
  132 |   expect(
  133 |     calls.find((c) => c.action === "project")?.body.answers.play_style,
  134 |   ).toBe("Friends carry pets together");
  135 |   await page.getByText("Edit original brief", { exact: true }).click();
  136 |   await page
  137 |     .getByLabel("Project request", { exact: true })
  138 |     .fill("Make a cooperative pet rescue game");
  139 |   await expect(
  140 |     page.getByRole("button", { name: "Approve brief" }),
  141 |   ).toBeDisabled();
  142 |   await page
  143 |     .getByRole("button", { name: "Update concept from request", exact: true })
  144 |     .click();
  145 |   await expect(
  146 |     page.getByRole("button", { name: "Approve brief" }),
  147 |   ).toBeEnabled();
  148 |   expect(calls.filter((c) => c.action === "project").at(-1)?.body.request).toBe(
  149 |     "Make a cooperative pet rescue game",
  150 |   );
  151 |   expect(calls.filter((c) => c.action === "plan")).toHaveLength(0);
  152 | });
  153 | 
  154 | test("older running servers retain direct planning without offering an unavailable action", async ({
  155 |   page,
  156 | }) => {
  157 |   await page.route("**/api/status", (route) =>
  158 |     route.fulfill({
  159 |       json: { mode: "multi-model", configured: true, studios: [] },
  160 |     }),
  161 |   );
  162 |   await setup(page);
  163 |   await expect(
  164 |     page.getByRole("button", { name: "Plan this game" }),
  165 |   ).toBeVisible();
  166 |   await expect(
  167 |     page.getByRole("button", { name: "Shape my idea", exact: true }),
  168 |   ).toHaveCount(0);
  169 | });
  170 | 
  171 | test("a completed concept appears without waiting for another library scan", async ({
  172 |   page,
  173 |   isMobile,
  174 | }) => {
  175 |   const p = await (
  176 |     await page.request.post("/api/projects", {
  177 |       data: { request: "Make a pet rescue game" },
  178 |     })
  179 |   ).json();
  180 |   let reads = 0,
  181 |     listReads = 0;
  182 |   await page.route("**/api/projects", (route) => {
  183 |     listReads++;
  184 |     // A failed sidebar refresh must not hide already completed project work.
  185 |     return listReads > 1
  186 |       ? route.abort()
  187 |       : route.fulfill({
  188 |           json: [{ id: p.id, name: p.name, stage: "planning" }],
  189 |         });
  190 |   });
  191 |   await page.route("**/api/projects/" + p.id, (route) => {
  192 |     reads++;
  193 |     return route.fulfill({
  194 |       json:
  195 |         reads === 1
  196 |           ? { ...p, jobId: p.id, stage: "planning" }
  197 |           : {
  198 |               ...p,
  199 |               name: "Tiny pet rescue",
  200 |               concept: assessConcept(conceptProposalFixture(false), p),
  201 |             },
  202 |     });
  203 |   });
  204 |   await page.goto("/?project=" + p.id);
  205 |   await expect(
  206 |     page.getByRole("button", { name: "Approve brief" }),
  207 |   ).toBeEnabled();
  208 |   if (isMobile)
  209 |     await expect(
  210 |       page
  211 |         .getByRole("combobox", { name: "Open project" })
  212 |         .locator("option:checked"),
  213 |     ).toHaveText("Tiny pet rescue");
  214 |   else {
  215 |     await page.getByTitle("Projects", { exact: true }).click();
  216 |     await expect(
  217 |       page
  218 |         .getByRole("navigation", { name: "Projects", exact: true })
  219 |         .getByRole("button", { name: "Tiny pet rescue", exact: true }),
  220 |     ).toBeVisible();
  221 |   }
  222 |   expect(listReads).toBe(1);
> 223 |   await expect(page.getByRole("alert")).toHaveCount(0);
      |                                         ^ Error: expect(locator).toHaveCount(expected) failed
  224 | });
  225 | 
  226 | test("legacy and unresolved concepts remain inspectable without a planning action", async ({
  227 |   page,
  228 | }) => {
  229 |   const p = await (
  230 |     await page.request.post("/api/projects", {
  231 |       data: { request: "Make a game about a space station" },
  232 |     })
  233 |   ).json();
  234 |   let unresolved = false;
  235 |   await page.route("**/api/projects/" + p.id, (route) =>
  236 |     route.fulfill({
  237 |       json: {
  238 |         ...p,
  239 |         concept: unresolved
  240 |           ? assessConcept(
  241 |               {
  242 |                 ...conceptProposalFixture(false),
  243 |                 unresolvedIssues: [
  244 |                   "Choose whether the station focuses on trading or exploration.",
  245 |                 ],
  246 |               },
  247 |               p,
  248 |             )
  249 |           : { ...conceptFixture(false), revision: p.revision },
  250 |       },
  251 |     }),
  252 |   );
  253 |   await page.goto("/?project=" + p.id);
  254 |   await expect(
  255 |     page.getByText("This saved concept needs an update before planning."),
  256 |   ).toBeVisible();
  257 |   await expect(page.getByRole("button", { name: "Approve brief" })).toHaveCount(
  258 |     0,
  259 |   );
  260 |   await expect(
  261 |     page.getByRole("button", { name: "Update my concept", exact: true }),
  262 |   ).toBeEnabled();
  263 |   unresolved = true;
  264 |   await page.reload();
  265 |   await expect(
  266 |     page.getByText(
  267 |       "Choose whether the station focuses on trading or exploration.",
  268 |     ),
  269 |   ).toBeVisible();
  270 |   await expect(
  271 |     page.getByText("Choices to review", { exact: true }),
  272 |   ).toBeVisible();
  273 |   await expect(page.getByRole("button", { name: "Approve brief" })).toHaveCount(
  274 |     0,
  275 |   );
  276 | });
  277 | 
```