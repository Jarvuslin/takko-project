# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asset-choices.spec.ts >> connection failures and empty results give an explicit recovery path
- Location: tests\browser\asset-choices.spec.ts:144:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog').getByText(/Connect Roblox Studio/)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog').getByText(/Connect Roblox Studio/) with timeout 5000ms
  - waiting for getByRole('dialog').getByText(/Connect Roblox Studio/)

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
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - option "I want a combat game with basic fighting and a target dummy to p" [selected]
  - region "Game architecture":
    - strong: Game architecture
    - text: draft · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - strong: Start with your first game system
    - paragraph: Describe your game to Takko, or add a system using the toolbar.
    - button "Ask Takko"
    - img "System connections"
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - heading "I want a combat game with basic fighting and a target dummy to p" [level=1]
  - region "Project conversation":
    - strong: Takko
    - text: draft
    - button "Latest ↓"
    - button "History"
    - text: $0.0000 / $2.0000
    - article:
      - strong: Takko
      - text: r1 · 01:29 AM
      - paragraph: Saved project. Earlier conversation was not recorded. I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx
    - group: Preview an animation clip
    - region "Studio in conversation"
    - group: Edit original brief
    - button "Shape my idea"
    - button "Approve brief"
    - button "Plan this game ↗"
    - button "Configure models"
    - paragraph: Shape your idea, then review the plan before building. Uses your planner and generation budget.
    - region "Assets for your brief":
      - text: ASSETS FOR YOUR BRIEF
      - heading "Find your game’s look and movement" [level=2]
      - paragraph: Takko searches the free Creator Store using your brief. Nothing is inserted yet.
      - button "Preview & choose assets"
    - paragraph: Your build plan appears after planning.
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Enter to send · Shift + Enter for a new line
- dialog "Choose assets":
  - banner:
    - heading "Choose assets" [level=2]
    - button "Close dialog"
  - paragraph: Preview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.
  - region "Studio connection":
    - status:
      - strong: Studio disconnected
    - text: Studio
    - combobox "Asset search Studio":
      - option "Select Studio" [selected]
    - button "Refresh connection"
    - button "Connect Studio"
    - button "Find assets" [disabled]
    - paragraph: Open your place in Roblox Studio and enable Studio as an MCP server, then refresh.
  - navigation "Asset groups"
  - contentinfo:
    - paragraph: Approve the brief in the conversation before approving these choices.
    - button "Approve assets & create plan" [disabled]
```

# Test source

```ts
  55  |   await preview
  56  |     .getByRole("button", { name: "Choose this asset", exact: true })
  57  |     .click();
  58  |   await dialog
  59  |     .getByRole("button", { name: "Fighting animation", exact: true })
  60  |     .click();
  61  |   const combat = dialog.getByRole("region", {
  62  |     name: "Fighting animation",
  63  |     exact: true,
  64  |   });
  65  |   await combat
  66  |     .getByRole("button", { name: "Preview", exact: true })
  67  |     .first()
  68  |     .click();
  69  |   preview = page.getByRole("dialog", {
  70  |     name: "Fighting animation option 1",
  71  |     exact: true,
  72  |   });
  73  |   await preview
  74  |     .getByLabel("Clip from Fighting animation option 1")
  75  |     .selectOption("Kick");
  76  |   expect(f.project().assetDiscovery?.choices?.combat).toBeUndefined();
  77  |   await expect(preview.locator("canvas")).toBeVisible();
  78  |   await preview.getByRole("slider", { name: /Position in/ }).fill("0.75");
  79  |   await preview
  80  |     .getByRole("button", { name: "Choose this asset", exact: true })
  81  |     .click();
  82  |   await page.screenshot({
  83  |     path: `docs/results/surgical-ux/options-${info.project.name}.png`,
  84  |   });
  85  |   for (const label of [
  86  |     "Sprint animation",
  87  |     "Walk animation",
  88  |     "Sound effects",
  89  |     "Visual effects",
  90  |   ]) {
  91  |     await dialog.getByRole("button", { name: label, exact: true }).click();
  92  |     await dialog
  93  |       .getByRole("region", { name: label, exact: true })
  94  |       .getByRole("radio", { name: "Find later", exact: true })
  95  |       .check();
  96  |   }
  97  |   expect(
  98  |     (await new AxeBuilder({ page }).include(".focused-dialog").analyze())
  99  |       .violations,
  100 |   ).toEqual([]);
  101 |   await page.keyboard.press("Escape");
  102 |   await expect(dialog).toBeHidden();
  103 |   await page.reload();
  104 |   await page.getByRole("button", { name: "Preview & choose assets" }).click();
  105 |   await dialog
  106 |     .getByRole("button", { name: "Fighting animation ✓", exact: true })
  107 |     .click();
  108 |   await expect(
  109 |     dialog.getByRole("button", { name: "Selected ✓", exact: true }),
  110 |   ).toBeVisible();
  111 |   await dialog
  112 |     .getByRole("button", { name: "Approve assets & create plan" })
  113 |     .click();
  114 |   await expect(
  115 |     page.getByText("Asset choices approved", { exact: true }),
  116 |   ).toBeVisible();
  117 |   await expect(
  118 |     page.getByRole("button", { name: "Approve specification", exact: true }),
  119 |   ).toBeVisible();
  120 |   expect(f.calls.filter((c) => c === "plan")).toHaveLength(1);
  121 |   expect(f.project().assetDiscovery?.choices?.combat.clipKey).toBe("Kick");
  122 |   expect(f.errors).toEqual([]);
  123 | });
  124 | test("dirty and changed briefs invalidate approval and search again", async ({
  125 |   page,
  126 | }) => {
  127 |   const f = await assetChoiceFixture(page);
  128 |   await expect(page.getByText(/6 asset groups/)).toBeVisible();
  129 |   await page
  130 |     .getByRole("button", { name: "Approve brief", exact: true })
  131 |     .click();
  132 |   await page.getByText("Edit original brief", { exact: true }).click();
  133 |   await page
  134 |     .getByLabel("Project request", { exact: true })
  135 |     .fill("A fishing game with a pond and fish models");
  136 |   await page
  137 |     .getByRole("button", { name: "Approve brief", exact: true })
  138 |     .click();
  139 |   await expect(page.getByText(/1 asset groups/)).toBeVisible();
  140 |   expect(f.calls.filter((c) => c === "asset-options")).toHaveLength(2);
  141 |   expect(f.project().revision).toBe(2);
  142 |   expect(f.project().assetDiscovery?.approved).toBeUndefined();
  143 | });
  144 | test("connection failures and empty results give an explicit recovery path", async ({
  145 |   page,
  146 | }) => {
  147 |   await assetChoiceFixture(page);
  148 |   await page.route("**/api/marketplace/studios", (r) =>
  149 |     r.fulfill({ json: { studios: [] } }),
  150 |   );
  151 |   await page.reload();
  152 |   await page.getByRole("button", { name: "Preview & choose assets" }).click();
  153 |   await expect(
  154 |     page.getByRole("dialog").getByText("Studio disconnected", { exact: true }),
> 155 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  156 |   await expect(
  157 |     page.getByRole("button", { name: "Find assets", exact: true }),
  158 |   ).toBeDisabled();
  159 |   await expect(
  160 |     page.getByRole("button", { name: "Connect Studio", exact: true }),
  161 |   ).toBeVisible();
  162 | });
  163 | 
```