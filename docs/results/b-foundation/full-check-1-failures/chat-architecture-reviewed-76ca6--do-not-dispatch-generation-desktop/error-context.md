# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-architecture.spec.ts >> reviewed node connections persist and do not dispatch generation
- Location: tests\browser\chat-architecture.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Game architecture' }).getByRole('button', { name: 'Save architecture', exact: true })
    - locator resolved to <button>Save architecture</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
      - waiting 100ms
    59 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - element is outside of the viewport
     - retrying click action
       - waiting 500ms

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
      - generic "Projects" [ref=e26] [cursor=pointer]
    - link "Download plugin" [ref=e31] [cursor=pointer]:
      - /url: /api/studio/plugin
  - main [ref=e35]:
    - generic [ref=e36]:
      - generic [ref=e37]: Workspace/A combat game with energy
      - generic [ref=e38]:
        - button "Connect to Studio" [ref=e39] [cursor=pointer]
        - button "Models" [ref=e41] [cursor=pointer]
    - generic [ref=e44]:
      - region "Game architecture" [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - generic [ref=e48]: Your game, connected
            - strong [ref=e49]: Game architecture
            - generic [ref=e50]: draft · Game architecture
          - generic [ref=e51]:
            - button "Build details" [ref=e52] [cursor=pointer]: Build
            - button "Source details" [ref=e53] [cursor=pointer]: Source
            - button "Studio details" [ref=e54] [cursor=pointer]: Studio
        - generic [ref=e55]:
          - generic [ref=e56]: 2 systems · 1 connections
          - button "Discard draft" [ref=e57] [cursor=pointer]
          - button "Connections" [ref=e58] [cursor=pointer]
          - button "Add system" [ref=e59] [cursor=pointer]
        - generic "Architecture canvas" [ref=e60]:
          - generic [ref=e61]:
            - img "System connections":
              - generic: Hit confirmed
            - generic [ref=e62]:
              - button "Edit Combat" [ref=e63]:
                - generic [ref=e64]: Server · trusted logic
                - strong [ref=e65]: Combat
                - generic [ref=e66]: Design
              - generic [ref=e67]:
                - button "Receive at Combat" [ref=e68] [cursor=pointer]: ● In
                - button "Connect from Combat" [ref=e69] [cursor=pointer]: Out ●
            - generic [ref=e70]:
              - button "Edit Energy" [ref=e71]:
                - generic [ref=e72]: Server · trusted logic
                - strong [ref=e73]: Energy
                - generic [ref=e74]: Design
              - generic [ref=e75]:
                - button "Receive at Energy" [ref=e76] [cursor=pointer]: ● In
                - button "Connect from Energy" [ref=e77] [cursor=pointer]: Out ●
        - generic "Canvas controls" [ref=e78]:
          - button "Zoom out canvas" [ref=e79] [cursor=pointer]: −
          - generic [ref=e80]: 25%
          - button "Zoom in canvas" [ref=e81] [cursor=pointer]: +
          - button "Fit" [ref=e82] [cursor=pointer]
          - button "Auto layout" [ref=e83] [cursor=pointer]
        - complementary "Architecture inspector" [ref=e84]:
          - generic [ref=e85]:
            - strong [ref=e86]: Energy
            - button "Close inspector" [ref=e87] [cursor=pointer]: ×
          - group "System details" [ref=e88]:
            - generic [ref=e90]:
              - text: System name
              - textbox "System name" [ref=e91]: Energy
            - generic [ref=e92]:
              - text: What does it do?
              - textbox "What does it do?" [ref=e93]: Store each player's energy.
            - generic [ref=e94]:
              - text: Runs on
              - combobox "Runs on" [ref=e95]:
                - 'option "Server: rules, rewards, damage" [selected]'
                - 'option "Player: controls, visuals, sound"'
                - 'option "Shared: reusable logic"'
            - paragraph [ref=e96]: No implementation is linked yet. Save and plan this architecture to assign files.
            - button "Discuss this system" [ref=e97] [cursor=pointer]
            - button "Remove system and its connections" [ref=e98] [cursor=pointer]
          - group "Connect systems" [ref=e99]:
            - generic [ref=e101]:
              - generic [ref=e102]:
                - text: From
                - combobox "From" [ref=e103]:
                  - option "Choose system"
                  - option "Combat" [selected]
                  - option "Energy"
              - generic [ref=e104]:
                - text: To
                - combobox "To" [ref=e105]:
                  - option "Choose system"
                  - option "Energy" [selected]
              - generic [ref=e106]:
                - text: Connection type
                - combobox "Connection type" [ref=e107]:
                  - option "When something happens" [selected]
                  - option "When a value changes"
            - generic [ref=e108]:
              - text: When
              - textbox "When" [ref=e109]:
                - /placeholder: A hit lands
            - generic [ref=e110]:
              - text: Then
              - textbox "Then" [ref=e111]:
                - /placeholder: Add 10 energy to the attacker. The server verifies the hit first.
            - button "Add connection" [ref=e112] [cursor=pointer]
          - list [ref=e113]:
            - listitem [ref=e114]:
              - generic [ref=e115]:
                - strong [ref=e116]: Combat → Energy
                - paragraph [ref=e117]: "When Hit confirmed: Award ten energy after server validation."
              - button "Remove connection Hit confirmed" [ref=e118] [cursor=pointer]: Remove
        - generic [ref=e119]:
          - generic [ref=e120]:
            - strong [ref=e121]: Review before saving
            - paragraph [ref=e122]: This replaces the architecture with 2 systems and 1 connections. Your old plan and approval will be cleared. The previous artifact stays in project history. Saving does not change Studio or spend money.
            - paragraph [ref=e123]: The next plan must assign every system and connection to requirements and implementation tasks. Runtime behavior still needs a build and a playtest.
          - button "Save architecture" [active] [ref=e125] [cursor=pointer]
      - heading "A combat game with energy" [level=1] [ref=e126]
      - region "Project conversation" [ref=e127]:
        - generic [ref=e128]:
          - strong [ref=e130]: Takko
          - generic [ref=e131]: draft
          - button "Latest ↓" [ref=e132] [cursor=pointer]
          - button "History" [ref=e133] [cursor=pointer]
        - generic [ref=e136]:
          - generic [ref=e137]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e139]:
            - article [ref=e140]:
              - generic [ref=e141]:
                - strong [ref=e142]: You
                - generic [ref=e143]: Revision 1 · 12:13 PM
              - paragraph [ref=e144]: A combat game with energy
          - group [ref=e145]:
            - generic "Preview an animation clip" [ref=e146] [cursor=pointer]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - region "Studio in conversation"
              - group [ref=e149]:
                - generic "Edit original brief" [ref=e150] [cursor=pointer]
                - generic [ref=e151]:
                  - heading "Your request" [level=2] [ref=e152]
                  - generic [ref=e153]: Revision 1
                - paragraph [ref=e154]: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
                - generic [ref=e155]: Project request
                - textbox "Project request" [ref=e156]: A combat game with energy
              - generic [ref=e157]:
                - button "Shape my idea" [ref=e158] [cursor=pointer]
                - button "Plan this game ↗" [ref=e159] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e160]: ↗
                - button "Configure models" [ref=e161] [cursor=pointer]
              - paragraph [ref=e162]: Shape your idea into a clear game concept before planning. Uses your planner model and generation budget.
            - group [ref=e163]:
              - generic "Build plan · 0 tasks" [ref=e164] [cursor=pointer]
        - generic [ref=e165]:
          - generic [ref=e166]: Message
          - textbox "Message" [ref=e167]:
            - /placeholder: What would you like to add or change?
          - group "Attached assets"
          - generic [ref=e168]:
            - button "Browse Marketplace assets" [ref=e169] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e172] [cursor=pointer]
            - button "Presets" [ref=e175] [cursor=pointer]
            - button "Budget for this generation" [ref=e178] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e179]
          - generic [ref=e182]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { randomUUID } from "node:crypto";
  3   | test.use({ video: "on" });
  4   | 
  5   | test("reviewed node connections persist and do not dispatch generation", async ({
  6   |   page,
  7   | }, info) => {
  8   |   const p = await (
  9   |     await page.request.post("/api/projects", {
  10  |       data: { request: "A combat game with energy" },
  11  |     })
  12  |   ).json();
  13  |   let generations = 0;
  14  |   await page.route(/\/api\/projects\/[^/]+\/(plan|build|concept)$/, (route) => {
  15  |     generations++;
  16  |     return route.abort();
  17  |   });
  18  |   await page.goto(`/?project=${p.id}`);
  19  |   const dialog = page.getByRole("region", { name: "Game architecture" });
  20  |   await dialog.getByRole("button", { name: "Add system", exact: true }).click();
  21  |   await dialog.getByLabel("System name", { exact: true }).fill("Combat");
  22  |   await dialog
  23  |     .getByLabel("What does it do?", { exact: true })
  24  |     .fill("Validate attacks and deal damage on the server.");
  25  |   await dialog.getByRole("button", { name: "Close inspector" }).click();
  26  |   await dialog.getByRole("button", { name: "Add system", exact: true }).click();
  27  |   await dialog.getByLabel("System name", { exact: true }).fill("Energy");
  28  |   await dialog
  29  |     .getByLabel("What does it do?", { exact: true })
  30  |     .fill("Store each player's energy.");
  31  |   await dialog
  32  |     .getByLabel("From", { exact: true })
  33  |     .selectOption({ label: "Combat" });
  34  |   await dialog
  35  |     .getByLabel("To", { exact: true })
  36  |     .selectOption({ label: "Energy" });
  37  |   await dialog.getByLabel("When", { exact: true }).fill("Hit confirmed");
  38  |   await dialog
  39  |     .getByLabel("Then", { exact: true })
  40  |     .fill("Award ten energy after server validation.");
  41  |   await dialog
  42  |     .getByRole("button", { name: "Add connection", exact: true })
  43  |     .click();
  44  |   await dialog
  45  |     .getByRole("button", { name: "Review changes", exact: true })
  46  |     .click();
  47  |   await expect(dialog).toContainText(
  48  |     "Saving does not change Studio or spend money",
  49  |   );
  50  |   expect(
  51  |     (await (await page.request.get(`/api/projects/${p.id}`)).json())
  52  |       .architecture,
  53  |   ).toBeUndefined();
  54  |   await dialog
  55  |     .getByRole("button", { name: "Save architecture", exact: true })
> 56  |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  57  |   await expect(
  58  |     dialog.getByRole("button", { name: "Review changes", exact: true }),
  59  |   ).toBeHidden();
  60  |   await expect(dialog).toBeVisible();
  61  |   await expect(page.getByLabel("Saved conversation")).toContainText(
  62  |     "2 systems, 1 connections",
  63  |   );
  64  |   await page.reload();
  65  |   await expect(
  66  |     dialog.getByRole("button", { name: "Edit Combat", exact: true }),
  67  |   ).toBeVisible();
  68  |   await dialog
  69  |     .getByRole("button", { name: "Connections", exact: true })
  70  |     .click();
  71  |   await expect(dialog).toContainText(
  72  |     "Award ten energy after server validation",
  73  |   );
  74  |   await dialog.screenshot({
  75  |     path: `docs/results/chat-architecture-${info.project.name}.png`,
  76  |   });
  77  |   await page.keyboard.press("Escape");
  78  |   expect(generations).toBe(0);
  79  | });
  80  | 
  81  | test("chat retains message drafts and opens technical details without losing them", async ({
  82  |   page,
  83  | }) => {
  84  |   const p = await (
  85  |     await page.request.post("/api/projects", {
  86  |       data: { request: "A cooperative garden game" },
  87  |     })
  88  |   ).json();
  89  |   await page.goto(`/?project=${p.id}`);
  90  |   await page
  91  |     .getByLabel("Message", { exact: true })
  92  |     .fill("Add a shared harvest basket");
  93  |   await page.reload();
  94  |   const composer = await page.locator(".chat-composer").boundingBox();
  95  |   expect(composer!.y + composer!.height).toBeLessThanOrEqual(
  96  |     page.viewportSize()!.height + 1,
  97  |   );
  98  |   await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
  99  |     "Add a shared harvest basket",
  100 |   );
  101 |   await page
  102 |     .getByRole("button", { name: "Source details", exact: true })
  103 |     .click();
  104 |   await expect(
  105 |     page.getByRole("dialog", { name: "Source details" }),
  106 |   ).toBeVisible();
  107 |   await page.keyboard.press("Escape");
  108 |   await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
  109 |     "Add a shared harvest basket",
  110 |   );
  111 |   await page.getByRole("button", { name: "History", exact: true }).click();
  112 |   await page
  113 |     .getByLabel("Search saved messages", { exact: true })
  114 |     .fill("garden");
  115 |   await expect(page.getByRole("dialog")).toContainText(
  116 |     "A cooperative garden game",
  117 |   );
  118 |   await page.keyboard.press("Escape");
  119 |   await expect(
  120 |     page.getByRole("button", { name: "History", exact: true }),
  121 |   ).toBeFocused();
  122 | });
  123 | 
  124 | test("actual imported keyframes move the inline rig and survive refresh", async ({
  125 |   page,
  126 | }, info) => {
  127 |   const p = await (
  128 |     await page.request.post("/api/projects", {
  129 |       data: { request: "A punch animation preview" },
  130 |     })
  131 |   ).json();
  132 |   const clip = {
  133 |     version: 1,
  134 |     name: "Test punch",
  135 |     rig: "R6",
  136 |     duration: 1,
  137 |     tracks: [
  138 |       {
  139 |         joint: "Right Arm",
  140 |         keys: [
  141 |           { time: 0, rotation: [0, 0, 0] },
  142 |           { time: 0.5, rotation: [-1.5, 0, 0] },
  143 |           { time: 1, rotation: [0, 0, 0] },
  144 |         ],
  145 |       },
  146 |     ],
  147 |   };
  148 |   await page.goto(`/?project=${p.id}`);
  149 |   await page.getByText("Preview an animation clip", { exact: true }).click();
  150 |   await page.getByLabel("Animation clip JSON", { exact: true }).setInputFiles({
  151 |     name: "punch.json",
  152 |     mimeType: "application/json",
  153 |     buffer: Buffer.from(JSON.stringify(clip)),
  154 |   });
  155 |   const viewer = page.getByRole("img", {
  156 |     name: "Test punch on R6",
```