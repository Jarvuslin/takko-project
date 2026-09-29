# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-polish.spec.ts >> focused decisions retain choices, support multiple and skip, and save a compact receipt
- Location: tests\browser\ui-polish.spec.ts:5:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 0

  Array [
    "PATCH",
    "concept",
    "PATCH",
-   "concept",
  ]
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - link "Takko home" [ref=f1e5] [cursor=pointer]:
      - /url: /
    - button "New project" [ref=f1e8] [cursor=pointer]
    - button "Marketplace" [ref=f1e12] [cursor=pointer]
    - navigation "Workspace" [ref=f1e16]:
      - button "Models" [ref=f1e17] [cursor=pointer]
      - button "Presets" [ref=f1e21] [cursor=pointer]
    - group [ref=f1e25]:
      - generic "Projects" [ref=f1e26] [cursor=pointer]
    - link "Download plugin" [ref=f1e31] [cursor=pointer]:
      - /url: /api/studio/plugin
  - main [ref=f1e35]:
    - generic [ref=f1e36]:
      - generic [ref=f1e37]: "Workspace/UI QA: Practice punches and kicks in a training yard. Offline fi"
      - generic [ref=f1e38]:
        - button "Connect to Studio" [ref=f1e39] [cursor=pointer]
        - button "Models" [ref=f1e41] [cursor=pointer]
    - generic [ref=f1e44]:
      - region "Game architecture" [ref=f1e45]:
        - generic [ref=f1e46]:
          - generic [ref=f1e47]:
            - generic [ref=f1e48]: Your game, connected
            - strong [ref=f1e49]: Game architecture
            - generic [ref=f1e50]: draft · Game architecture
          - generic [ref=f1e51]:
            - button "Build details" [ref=f1e52] [cursor=pointer]: Build
            - button "Source details" [ref=f1e53] [cursor=pointer]: Source
            - button "Studio details" [ref=f1e54] [cursor=pointer]: Studio
        - generic [ref=f1e55]:
          - generic [ref=f1e56]: 0 systems · 0 connections
          - button "Connections" [ref=f1e57] [cursor=pointer]
          - button "Add system" [ref=f1e58] [cursor=pointer]
        - generic "Architecture canvas" [ref=f1e59]:
          - generic [ref=f1e60]:
            - strong [ref=f1e61]: Start with your first game system
            - paragraph [ref=f1e62]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=f1e63] [cursor=pointer]
            - generic [ref=f1e64]: Combat · Inventory · Quests
          - generic [ref=f1e65]:
            - img "System connections"
        - generic "Canvas controls" [ref=f1e66]:
          - button "Zoom out canvas" [ref=f1e67] [cursor=pointer]: −
          - generic [ref=f1e68]: 100%
          - button "Zoom in canvas" [ref=f1e69] [cursor=pointer]: +
          - button "Fit" [ref=f1e70] [cursor=pointer]
          - button "Auto layout" [ref=f1e71] [cursor=pointer]
      - separator "Resize Takko panel" [ref=f1e72]
      - 'heading "UI QA: Practice punches and kicks in a training yard. Offline fi" [level=1] [ref=f1e73]'
      - region "Project conversation" [ref=f1e74]:
        - generic [ref=f1e75]:
          - strong [ref=f1e77]: Takko
          - generic [ref=f1e78]: draft
          - button "Latest ↓" [ref=f1e79] [cursor=pointer]
          - button "History" [ref=f1e80] [cursor=pointer]
        - generic [ref=f1e83]:
          - generic [ref=f1e84]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=f1e86]:
            - article [ref=f1e87]:
              - generic [ref=f1e88]:
                - strong [ref=f1e89]: You
                - generic [ref=f1e90]: r1 · 05:59 PM
              - paragraph [ref=f1e91]: "UI QA: Practice punches and kicks in a training yard. Offline fixture."
            - article [ref=f1e92]:
              - generic [ref=f1e93]:
                - strong [ref=f1e94]: You
                - generic [ref=f1e95]: r2 · 05:59 PM
              - generic [ref=f1e96]:
                - strong [ref=f1e97]: Clarifications
                - generic [ref=f1e98]:
                  - generic [ref=f1e99]:
                    - term [ref=f1e100]: What combat style should the player use?
                    - definition [ref=f1e101]: Fists + kicks
                  - generic [ref=f1e102]:
                    - term [ref=f1e103]: Which feedback matters most?
                    - definition [ref=f1e104]: Impact sounds Hit effects
                - button "Edit answers" [ref=f1e105] [cursor=pointer]
            - article [ref=f1e106]:
              - generic [ref=f1e107]:
                - strong [ref=f1e108]: You
                - generic [ref=f1e109]: r3 · 05:59 PM
              - generic [ref=f1e110]:
                - strong [ref=f1e111]: Clarifications
                - generic [ref=f1e113]:
                  - term [ref=f1e114]: What combat style should the player use?
                  - definition [ref=f1e115]: Fists only
                - button "Edit answers" [ref=f1e116] [cursor=pointer]
          - group [ref=f1e117]:
            - generic "Preview an animation clip" [ref=f1e118] [cursor=pointer]
          - generic [ref=f1e119]:
            - generic [ref=f1e120]:
              - region "Studio in conversation"
              - group [ref=f1e121]:
                - generic "Edit original brief" [ref=f1e122] [cursor=pointer]
            - paragraph [ref=f1e123]: Your build plan appears after planning.
        - generic [ref=f1e124]:
          - generic [ref=f1e125]: Message
          - textbox "Message" [disabled] [ref=f1e126]:
            - /placeholder: What would you like to add or change?
          - generic [ref=f1e127]:
            - button "Browse Marketplace assets" [ref=f1e128] [cursor=pointer]
            - button "Attach Studio feedback" [ref=f1e131] [cursor=pointer]
            - button "Presets" [ref=f1e134] [cursor=pointer]
            - button "Budget for this generation" [ref=f1e137] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=f1e138]
          - generic [ref=f1e141]: Takko is working. You can cancel above.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { polishFixture } from "./ui-polish-fixture";
  4   | 
  5   | test("focused decisions retain choices, support multiple and skip, and save a compact receipt", async ({
  6   |   page,
  7   | }, info) => {
  8   |   const f = await polishFixture(page);
  9   |   await page.goto("/?project=" + f.id);
  10  |   await page
  11  |     .getByRole("button", { name: "Answer questions", exact: true })
  12  |     .click();
  13  |   const dialog = page.getByRole("dialog", {
  14  |     name: "Help Takko shape the game",
  15  |   });
  16  |   await expect(
  17  |     dialog.getByRole("button", { name: "Continue", exact: true }),
  18  |   ).toBeDisabled();
  19  |   await dialog
  20  |     .getByRole("radio", { name: "Fists + kicks", exact: true })
  21  |     .check();
  22  |   await dialog
  23  |     .getByRole("radio", { name: "Fists + kicks", exact: true })
  24  |     .press("Enter");
  25  |   await dialog
  26  |     .getByRole("checkbox", { name: "Impact sounds", exact: true })
  27  |     .check();
  28  |   await dialog
  29  |     .getByRole("checkbox", { name: "Hit effects", exact: true })
  30  |     .check();
  31  |   await dialog.getByRole("button", { name: "Back", exact: true }).click();
  32  |   await expect(
  33  |     dialog.getByRole("radio", { name: "Fists + kicks", exact: true }),
  34  |   ).toBeChecked();
  35  |   await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  36  |   await expect(
  37  |     dialog.getByRole("checkbox", { name: "Hit effects", exact: true }),
  38  |   ).toBeChecked();
  39  |   await dialog.screenshot({
  40  |     path: `docs/results/ui-polish/questions-${info.project.name}.png`,
  41  |   });
  42  |   expect(
  43  |     (await new AxeBuilder({ page }).include(".clarification-flow").analyze())
  44  |       .violations,
  45  |   ).toEqual([]);
  46  |   await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  47  |   await dialog.getByRole("button", { name: "Skip", exact: true }).click();
  48  |   await expect(dialog.getByText("Skipped", { exact: true })).toBeVisible();
  49  |   await dialog
  50  |     .getByRole("button", { name: "Confirm answers", exact: true })
  51  |     .click();
  52  |   expect(f.calls).toEqual([]);
  53  |   await expect(
  54  |     page.getByRole("button", { name: "Edit answers", exact: true }),
  55  |   ).toBeFocused();
  56  |   await page.reload();
  57  |   await expect(page.locator(".clarifications")).toContainText("Fists + kicks");
  58  |   await page
  59  |     .getByRole("button", { name: "Update my concept", exact: true })
  60  |     .click();
  61  |   await expect(page.locator(".saved-clarifications")).toContainText(
  62  |     "Fists + kicks",
  63  |   );
  64  |   expect(f.calls).toEqual(["PATCH", "concept"]);
  65  |   await page.screenshot({
  66  |     path: `docs/results/ui-polish/receipt-${info.project.name}.png`,
  67  |   });
  68  |   await page
  69  |     .locator(".saved-clarifications")
  70  |     .getByRole("button", { name: "Edit answers" })
  71  |     .click();
  72  |   await dialog.getByLabel("Your answer", { exact: true }).fill("Fists only");
  73  |   await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  74  |   await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  75  |   await dialog
  76  |     .getByRole("button", { name: "Confirm answers", exact: true })
  77  |     .click();
  78  |   await expect(
  79  |     page.getByRole("button", { name: "Approve brief" }),
  80  |   ).toBeDisabled();
  81  |   await page
  82  |     .getByRole("button", { name: "Update concept", exact: true })
  83  |     .click();
  84  |   expect(f.project().answers.combat).toBe("Fists only");
> 85  |   expect(f.calls).toEqual(["PATCH", "concept", "PATCH", "concept"]);
      |                   ^ Error: expect(received).toEqual(expected) // deep equality
  86  | });
  87  | 
  88  | test("dialog custom input, focus loop, Escape and restored draft work without submission", async ({
  89  |   page,
  90  | }) => {
  91  |   const f = await polishFixture(page);
  92  |   await page.goto("/?project=" + f.id);
  93  |   await page
  94  |     .getByRole("button", { name: "Answer questions", exact: true })
  95  |     .click();
  96  |   const d = page.getByRole("dialog");
  97  |   await d.getByRole("button", { name: "Other…", exact: true }).click();
  98  |   await d
  99  |     .getByLabel("Your answer", { exact: true })
  100 |     .fill("A staff with a defensive kick");
  101 |   await d.getByRole("button", { name: "Continue", exact: true }).press("Tab");
  102 |   await expect(
  103 |     d.getByRole("button", { name: "Close dialog", exact: true }),
  104 |   ).toBeFocused();
  105 |   await d
  106 |     .getByRole("button", { name: "Close dialog", exact: true })
  107 |     .press("Shift+Tab");
  108 |   await expect(
  109 |     d.getByRole("button", { name: "Continue", exact: true }),
  110 |   ).toBeFocused();
  111 |   await page.keyboard.press("Escape");
  112 |   await expect(d).toBeHidden();
  113 |   await expect(
  114 |     page.getByRole("button", { name: "Edit answers", exact: true }),
  115 |   ).toBeFocused();
  116 |   await page.getByRole("button", { name: "Edit answers", exact: true }).click();
  117 |   await expect(d.getByLabel("Your answer", { exact: true })).toHaveValue(
  118 |     "A staff with a defensive kick",
  119 |   );
  120 |   expect(f.calls).toEqual([]);
  121 | });
  122 | 
  123 | test("one simple decision stays inline and custom answers remain available", async ({
  124 |   page,
  125 | }) => {
  126 |   const f = await polishFixture(page, "simple");
  127 |   await page.goto("/?project=" + f.id);
  128 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  129 |   await page.getByRole("radio", { name: "R6", exact: true }).check();
  130 |   await expect(
  131 |     page.getByRole("radio", { name: "R6", exact: true }),
  132 |   ).toBeChecked();
  133 |   await page.getByRole("button", { name: "Other…", exact: true }).click();
  134 |   await page
  135 |     .getByLabel("Your answer", { exact: true })
  136 |     .fill("Let players choose their rig");
  137 |   await page
  138 |     .getByRole("button", { name: "Update my concept", exact: true })
  139 |     .click();
  140 |   expect(f.project().answers.rig).toBe("Let players choose their rig");
  141 | });
  142 | 
  143 | test("panel pointer and keyboard resize respect bounds and survive reload", async ({
  144 |   page,
  145 | }, info) => {
  146 |   test.skip(
  147 |     info.project.name === "mobile",
  148 |     "The phone uses stacked panels instead of a horizontal divider.",
  149 |   );
  150 |   await page.setViewportSize({ width: 1440, height: 900 });
  151 |   const f = await polishFixture(page, "build");
  152 |   await page.goto("/?project=" + f.id);
  153 |   const separator = page.getByRole("separator", { name: "Resize Takko panel" });
  154 |   const chat = page.getByRole("region", { name: "Project conversation" });
  155 |   await separator.press("Home");
  156 |   await expect(separator).toHaveAttribute("aria-valuenow", "320");
  157 |   await separator.press("ArrowLeft");
  158 |   await expect(separator).toHaveAttribute("aria-valuenow", "336");
  159 |   const box = (await separator.boundingBox())!;
  160 |   await page.mouse.move(box.x + 6, box.y + 100);
  161 |   await page.mouse.down();
  162 |   await page.mouse.move(150, box.y + 150, { steps: 5 });
  163 |   await page.mouse.up();
  164 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  165 |   expect((await chat.boundingBox())!.width).toBe(640);
  166 |   await page.reload();
  167 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  168 |   await page.setViewportSize({ width: 860, height: 640 });
  169 |   expect(
  170 |     (await page
  171 |       .getByRole("region", { name: "Game architecture" })
  172 |       .boundingBox())!.width,
  173 |   ).toBeGreaterThanOrEqual(379);
  174 |   expect((await chat.boundingBox())!.width).toBeGreaterThanOrEqual(320);
  175 |   await expect(
  176 |     page.getByRole("textbox", { name: "Message", exact: true }),
  177 |   ).toBeVisible();
  178 |   await page.screenshot({ path: "docs/results/ui-polish/minimum-desktop.png" });
  179 |   await page.setViewportSize({ width: 1440, height: 900 });
  180 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  181 |   await separator.dblclick();
  182 |   await expect(separator).toHaveAttribute("aria-valuenow", "400");
  183 | });
  184 | 
  185 | test("inspector, source, Studio, plan and composer stay usable", async ({
```