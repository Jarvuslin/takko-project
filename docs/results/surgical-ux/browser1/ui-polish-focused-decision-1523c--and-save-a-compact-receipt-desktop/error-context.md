# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-polish.spec.ts >> focused decisions retain choices, support multiple and skip, and save a compact receipt
- Location: tests\browser\ui-polish.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: 'Question' }).getByRole('button', { name: 'Next', exact: true })

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
        - dialog "Question" [ref=f1e75]:
          - generic [ref=f1e76]:
            - generic [ref=f1e77]:
              - heading "Question" [level=2] [ref=f1e78]
              - paragraph [ref=f1e79]: Question 2 of 2
            - button "Close dialog" [ref=f1e80] [cursor=pointer]
          - generic [ref=f1e83]:
            - generic [ref=f1e84]:
              - heading "Which feedback matters most?" [active] [level=3] [ref=f1e85]
              - group "Which feedback matters most?" [ref=f1e86]:
                - generic [ref=f1e88]:
                  - generic [ref=f1e89]: Your answer
                  - textbox "Your answer" [ref=f1e90]:
                    - /placeholder: Or write your own response…
                    - text: Impact sounds Hit effects
                - button "Choose for me" [ref=f1e92] [cursor=pointer]
            - generic [ref=f1e93]:
              - button "Back" [ref=f1e94] [cursor=pointer]
              - button "Send" [ref=f1e95] [cursor=pointer]
        - generic [ref=f1e96]:
          - strong [ref=f1e98]: Takko
          - generic [ref=f1e99]: draft
          - button "Latest ↓" [ref=f1e100] [cursor=pointer]
          - button "History" [ref=f1e101] [cursor=pointer]
        - generic [ref=f1e104]:
          - generic [ref=f1e105]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=f1e107]:
            - article [ref=f1e108]:
              - generic [ref=f1e109]:
                - strong [ref=f1e110]: You
                - generic [ref=f1e111]: r1 · 12:04 AM
              - paragraph [ref=f1e112]: "UI QA: Practice punches and kicks in a training yard. Offline fixture."
            - article [ref=f1e113]:
              - generic [ref=f1e114]:
                - strong [ref=f1e115]: You
                - generic [ref=f1e116]: r2 · 12:04 AM
              - generic [ref=f1e117]:
                - strong [ref=f1e118]: Clarifications
                - generic [ref=f1e119]:
                  - generic [ref=f1e120]:
                    - term [ref=f1e121]: What combat style should the player use?
                    - definition [ref=f1e122]: Fists + kicks
                  - generic [ref=f1e123]:
                    - term [ref=f1e124]: Which feedback matters most?
                    - definition [ref=f1e125]: Impact sounds Hit effects
                - button "Edit answers" [ref=f1e126] [cursor=pointer]
          - group [ref=f1e127]:
            - generic "Preview an animation clip" [ref=f1e128] [cursor=pointer]
          - generic [ref=f1e129]:
            - generic [ref=f1e130]:
              - region "Studio in conversation"
              - group [ref=f1e131]:
                - generic "Edit original brief" [ref=f1e132] [cursor=pointer]
              - generic [ref=f1e133]:
                - button "Update concept" [ref=f1e134] [cursor=pointer]
                - button "Configure models" [ref=f1e135] [cursor=pointer]
              - region "Your game concept" [ref=f1e136]:
                - heading "Practice arena" [level=2] [ref=f1e137]
                - paragraph [ref=f1e138]: Practice punches and kicks on a training dummy. Land a combo and see clear feedback.
                - paragraph [ref=f1e139]: "Look and feel: Bright, stylized training yard."
                - group [ref=f1e140]:
                  - generic "Choices to review" [ref=f1e141] [cursor=pointer]
                - generic [ref=f1e142]:
                  - heading "First thing to try" [level=3] [ref=f1e143]
                  - paragraph [ref=f1e144]: Land a hit and see the dummy react.
                  - group [ref=f1e145]:
                    - generic "How you’ll check it after building" [ref=f1e146] [cursor=pointer]
                - paragraph [ref=f1e147]: This is a proposed direction. Your full request stays in scope.
                - button "Approve brief" [disabled] [ref=f1e149]
                - paragraph [ref=f1e150]: Your choices or request have changed. Update the concept before continuing.
            - paragraph [ref=f1e151]: Your build plan appears after planning.
        - generic [ref=f1e152]:
          - generic [ref=f1e153]: Message
          - textbox "Message" [ref=f1e154]:
            - /placeholder: What would you like to add or change?
          - generic [ref=f1e155]:
            - button "Browse Marketplace assets" [ref=f1e156] [cursor=pointer]
            - button "Attach Studio feedback" [ref=f1e159] [cursor=pointer]
            - button "Presets" [ref=f1e162] [cursor=pointer]
            - button "Budget for this generation" [ref=f1e165] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=f1e166]
          - generic [ref=f1e169]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  1   | import { test, expect } from "./workspace-fixture";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { polishFixture } from "./ui-polish-fixture";
  4   | 
  5   | test("focused decisions retain choices, support multiple and skip, and save a compact receipt", async ({
  6   |   page,
  7   | }, info) => {
  8   |   const f = await polishFixture(page);
  9   |   await page.goto("/?project=" + f.id);
  10  | 
  11  |   const dialog = page.getByRole("dialog", {
  12  |     name: "Question",
  13  |   });
  14  |   await expect(
  15  |     dialog.getByRole("button", { name: "Next", exact: true }),
  16  |   ).toBeDisabled();
  17  |   await dialog
  18  |     .getByRole("radio", { name: "Fists + kicks", exact: true })
  19  |     .check();
  20  |   await dialog
  21  |     .getByRole("radio", { name: "Fists + kicks", exact: true })
  22  |     .press("Enter");
  23  |   await dialog
  24  |     .getByRole("checkbox", { name: "Impact sounds", exact: true })
  25  |     .check();
  26  |   await dialog
  27  |     .getByRole("checkbox", { name: "Hit effects", exact: true })
  28  |     .check();
  29  |   await dialog.getByRole("button", { name: "Back", exact: true }).click();
  30  |   await expect(
  31  |     dialog.getByRole("radio", { name: "Fists + kicks", exact: true }),
  32  |   ).toBeChecked();
  33  |   await dialog.getByRole("button", { name: "Next", exact: true }).click();
  34  |   await expect(
  35  |     dialog.getByRole("checkbox", { name: "Hit effects", exact: true }),
  36  |   ).toBeChecked();
  37  |   await dialog.screenshot({
  38  |     path: `docs/results/ui-polish/questions-${info.project.name}.png`,
  39  |   });
  40  |   expect(
  41  |     (await new AxeBuilder({ page }).include(".clarification-flow").analyze())
  42  |       .violations,
  43  |   ).toEqual([]);
  44  |   await dialog.getByRole("button", { name: "Next", exact: true }).click();
  45  |   await dialog.getByRole("button", { name: "Skip", exact: true }).click();
  46  |   await expect(dialog).toBeHidden();
  47  |   expect(f.calls).toEqual([]);
  48  |   await expect(
  49  |     page.getByRole("button", { name: "Edit answers", exact: true }),
  50  |   ).toBeFocused();
  51  |   await page.reload();
  52  |   await expect(page.locator(".clarifications")).toContainText("Fists + kicks");
  53  |   await page
  54  |     .getByRole("button", { name: "Update my concept", exact: true })
  55  |     .click();
  56  |   await expect(page.locator(".saved-clarifications")).toContainText(
  57  |     "Fists + kicks",
  58  |   );
  59  |   expect(f.calls).toEqual(["PATCH", "concept"]);
  60  |   await page.screenshot({
  61  |     path: `docs/results/ui-polish/receipt-${info.project.name}.png`,
  62  |   });
  63  |   await page
  64  |     .locator(".saved-clarifications")
  65  |     .getByRole("button", { name: "Edit answers" })
  66  |     .click();
  67  |   await dialog.getByLabel("Your answer", { exact: true }).fill("Fists only");
  68  |   await dialog.getByRole("button", { name: "Next", exact: true }).click();
> 69  |   await dialog.getByRole("button", { name: "Next", exact: true }).click();
      |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  70  |   await dialog.getByRole("button", { name: "Send", exact: true }).click();
  71  |   await expect(
  72  |     page.getByRole("button", { name: "Approve brief" }),
  73  |   ).toBeDisabled();
  74  |   await page
  75  |     .getByRole("button", { name: "Update concept", exact: true })
  76  |     .click();
  77  |   expect(f.project().answers.combat).toBe("Fists only");
  78  |   await expect
  79  |     .poll(() => f.calls)
  80  |     .toEqual(["PATCH", "concept", "PATCH", "concept"]);
  81  | });
  82  | 
  83  | test("dialog custom input, focus loop, Escape and restored draft work without submission", async ({
  84  |   page,
  85  | }) => {
  86  |   const f = await polishFixture(page);
  87  |   await page.goto("/?project=" + f.id);
  88  | 
  89  |   const d = page.getByRole("dialog");
  90  | 
  91  |   await d
  92  |     .getByLabel("Your answer", { exact: true })
  93  |     .fill("A staff with a defensive kick");
  94  |   await d.getByRole("button", { name: "Next", exact: true }).press("Tab");
  95  |   await expect(
  96  |     d.getByRole("button", { name: "Close dialog", exact: true }),
  97  |   ).toBeFocused();
  98  |   await d
  99  |     .getByRole("button", { name: "Close dialog", exact: true })
  100 |     .press("Shift+Tab");
  101 |   await expect(
  102 |     d.getByRole("button", { name: "Next", exact: true }),
  103 |   ).toBeFocused();
  104 |   await page.keyboard.press("Escape");
  105 |   await expect(d).toBeHidden();
  106 |   await expect(
  107 |     page.getByRole("button", { name: "Edit answers", exact: true }),
  108 |   ).toBeFocused();
  109 |   await page.getByRole("button", { name: "Edit answers", exact: true }).click();
  110 |   await expect(d.getByLabel("Your answer", { exact: true })).toHaveValue(
  111 |     "A staff with a defensive kick",
  112 |   );
  113 |   expect(f.calls).toEqual([]);
  114 | });
  115 | 
  116 | test("one simple decision stays inline and custom answers remain available", async ({
  117 |   page,
  118 | }) => {
  119 |   const f = await polishFixture(page, "simple");
  120 |   await page.goto("/?project=" + f.id);
  121 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  122 |   await page.getByRole("radio", { name: "R6", exact: true }).check();
  123 |   await expect(
  124 |     page.getByRole("radio", { name: "R6", exact: true }),
  125 |   ).toBeChecked();
  126 |   await page.getByRole("button", { name: "Other…", exact: true }).click();
  127 |   await page
  128 |     .getByLabel("Your answer", { exact: true })
  129 |     .fill("Let players choose their rig");
  130 |   await page
  131 |     .getByRole("button", { name: "Update my concept", exact: true })
  132 |     .click();
  133 |   expect(f.project().answers.rig).toBe("Let players choose their rig");
  134 | });
  135 | 
  136 | test("panel pointer and keyboard resize respect bounds and survive reload", async ({
  137 |   page,
  138 | }, info) => {
  139 |   test.skip(
  140 |     info.project.name === "mobile",
  141 |     "The phone uses stacked panels instead of a horizontal divider.",
  142 |   );
  143 |   await page.setViewportSize({ width: 1440, height: 900 });
  144 |   const f = await polishFixture(page, "build");
  145 |   await page.goto("/?project=" + f.id);
  146 |   const separator = page.getByRole("separator", { name: "Resize Takko panel" });
  147 |   const chat = page.getByRole("region", { name: "Project conversation" });
  148 |   await separator.press("Home");
  149 |   await expect(separator).toHaveAttribute("aria-valuenow", "320");
  150 |   await separator.press("ArrowLeft");
  151 |   await expect(separator).toHaveAttribute("aria-valuenow", "336");
  152 |   const box = (await separator.boundingBox())!;
  153 |   await page.mouse.move(box.x + 6, box.y + 100);
  154 |   await page.mouse.down();
  155 |   await page.mouse.move(150, box.y + 150, { steps: 5 });
  156 |   await page.mouse.up();
  157 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  158 |   expect((await chat.boundingBox())!.width).toBe(640);
  159 |   await page.reload();
  160 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  161 |   await page.setViewportSize({ width: 860, height: 640 });
  162 |   expect(
  163 |     (await page
  164 |       .getByRole("region", { name: "Game architecture" })
  165 |       .boundingBox())!.width,
  166 |   ).toBeGreaterThanOrEqual(379);
  167 |   expect((await chat.boundingBox())!.width).toBeGreaterThanOrEqual(320);
  168 |   await expect(
  169 |     page.getByRole("textbox", { name: "Message", exact: true }),
```