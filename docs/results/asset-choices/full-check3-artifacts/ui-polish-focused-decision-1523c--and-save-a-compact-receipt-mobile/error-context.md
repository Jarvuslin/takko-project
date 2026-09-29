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
      - generic [ref=f1e8]: takko
    - button "New project" [ref=f1e9] [cursor=pointer]
    - button "Marketplace" [ref=f1e13] [cursor=pointer]
    - navigation "Workspace" [ref=f1e17]:
      - button "Models" [ref=f1e18] [cursor=pointer]
      - button "Presets" [ref=f1e22] [cursor=pointer]
  - main [ref=f1e26]:
    - generic [ref=f1e27]:
      - text: Your projects
      - combobox "Open project" [ref=f1e28]:
        - option "New project"
        - 'option "UI QA: Practice punches and kicks in a training yard. Offline fi" [selected]'
    - generic [ref=f1e29]:
      - region "Game architecture" [ref=f1e30]:
        - generic [ref=f1e31]:
          - generic [ref=f1e32]:
            - strong [ref=f1e33]: Game architecture
            - generic [ref=f1e34]: draft · Game architecture
          - generic [ref=f1e35]:
            - button "Build details" [ref=f1e36] [cursor=pointer]: Build
            - button "Source details" [ref=f1e37] [cursor=pointer]: Source
            - button "Studio details" [ref=f1e38] [cursor=pointer]: Studio
        - generic [ref=f1e39]:
          - generic [ref=f1e40]: 0 systems · 0 connections
          - button "Connections" [ref=f1e41] [cursor=pointer]
          - button "Add system" [ref=f1e42] [cursor=pointer]
        - generic "Architecture canvas" [ref=f1e43]:
          - generic [ref=f1e44]:
            - strong [ref=f1e45]: Start with your first game system
            - paragraph [ref=f1e46]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=f1e47] [cursor=pointer]
          - generic [ref=f1e48]:
            - img "System connections"
        - generic "Canvas controls" [ref=f1e49]:
          - button "Zoom out canvas" [ref=f1e50] [cursor=pointer]: −
          - generic [ref=f1e51]: 100%
          - button "Zoom in canvas" [ref=f1e52] [cursor=pointer]: +
          - button "Fit" [ref=f1e53] [cursor=pointer]
          - button "Auto layout" [ref=f1e54] [cursor=pointer]
      - 'heading "UI QA: Practice punches and kicks in a training yard. Offline fi" [level=1] [ref=f1e55]'
      - region "Project conversation" [ref=f1e56]:
        - generic [ref=f1e57]:
          - strong [ref=f1e59]: Takko
          - generic [ref=f1e60]: draft
          - button "Latest ↓" [ref=f1e61] [cursor=pointer]
          - button "History" [ref=f1e62] [cursor=pointer]
        - generic [ref=f1e65]:
          - generic [ref=f1e66]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=f1e68]:
            - article [ref=f1e69]:
              - generic [ref=f1e70]:
                - strong [ref=f1e71]: You
                - generic [ref=f1e72]: r1 · 06:02 PM
              - paragraph [ref=f1e73]: "UI QA: Practice punches and kicks in a training yard. Offline fixture."
            - article [ref=f1e74]:
              - generic [ref=f1e75]:
                - strong [ref=f1e76]: You
                - generic [ref=f1e77]: r2 · 06:02 PM
              - generic [ref=f1e78]:
                - strong [ref=f1e79]: Clarifications
                - generic [ref=f1e80]:
                  - generic [ref=f1e81]:
                    - term [ref=f1e82]: What combat style should the player use?
                    - definition [ref=f1e83]: Fists + kicks
                  - generic [ref=f1e84]:
                    - term [ref=f1e85]: Which feedback matters most?
                    - definition [ref=f1e86]: Impact sounds Hit effects
                - button "Edit answers" [ref=f1e87] [cursor=pointer]
            - article [ref=f1e88]:
              - generic [ref=f1e89]:
                - strong [ref=f1e90]: You
                - generic [ref=f1e91]: r3 · 06:02 PM
              - generic [ref=f1e92]:
                - strong [ref=f1e93]: Clarifications
                - generic [ref=f1e95]:
                  - term [ref=f1e96]: What combat style should the player use?
                  - definition [ref=f1e97]: Fists only
                - button "Edit answers" [ref=f1e98] [cursor=pointer]
          - group [ref=f1e99]:
            - generic "Preview an animation clip" [ref=f1e100] [cursor=pointer]
          - generic [ref=f1e101]:
            - generic [ref=f1e102]:
              - region "Studio in conversation"
              - group [ref=f1e103]:
                - generic "Edit original brief" [ref=f1e104] [cursor=pointer]
            - paragraph [ref=f1e105]: Your build plan appears after planning.
        - generic [ref=f1e106]:
          - generic [ref=f1e107]: Message
          - textbox "Message" [disabled] [ref=f1e108]:
            - /placeholder: What would you like to add or change?
          - generic [ref=f1e109]:
            - button "Browse Marketplace assets" [ref=f1e110] [cursor=pointer]
            - button "Attach Studio feedback" [ref=f1e113] [cursor=pointer]
            - button "Presets" [ref=f1e116] [cursor=pointer]
            - button "Budget for this generation" [ref=f1e119] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=f1e120]
          - generic [ref=f1e123]: Takko is working. You can cancel above.
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
> 85  |   await expect
      |                   ^ Error: expect(received).toEqual(expected) // deep equality
  86  |     .poll(() => f.calls)
  87  |     .toEqual(["PATCH", "concept", "PATCH", "concept"]);
  88  | });
  89  | 
  90  | test("dialog custom input, focus loop, Escape and restored draft work without submission", async ({
  91  |   page,
  92  | }) => {
  93  |   const f = await polishFixture(page);
  94  |   await page.goto("/?project=" + f.id);
  95  |   await page
  96  |     .getByRole("button", { name: "Answer questions", exact: true })
  97  |     .click();
  98  |   const d = page.getByRole("dialog");
  99  |   await d.getByRole("button", { name: "Other…", exact: true }).click();
  100 |   await d
  101 |     .getByLabel("Your answer", { exact: true })
  102 |     .fill("A staff with a defensive kick");
  103 |   await d.getByRole("button", { name: "Continue", exact: true }).press("Tab");
  104 |   await expect(
  105 |     d.getByRole("button", { name: "Close dialog", exact: true }),
  106 |   ).toBeFocused();
  107 |   await d
  108 |     .getByRole("button", { name: "Close dialog", exact: true })
  109 |     .press("Shift+Tab");
  110 |   await expect(
  111 |     d.getByRole("button", { name: "Continue", exact: true }),
  112 |   ).toBeFocused();
  113 |   await page.keyboard.press("Escape");
  114 |   await expect(d).toBeHidden();
  115 |   await expect(
  116 |     page.getByRole("button", { name: "Edit answers", exact: true }),
  117 |   ).toBeFocused();
  118 |   await page.getByRole("button", { name: "Edit answers", exact: true }).click();
  119 |   await expect(d.getByLabel("Your answer", { exact: true })).toHaveValue(
  120 |     "A staff with a defensive kick",
  121 |   );
  122 |   expect(f.calls).toEqual([]);
  123 | });
  124 | 
  125 | test("one simple decision stays inline and custom answers remain available", async ({
  126 |   page,
  127 | }) => {
  128 |   const f = await polishFixture(page, "simple");
  129 |   await page.goto("/?project=" + f.id);
  130 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  131 |   await page.getByRole("radio", { name: "R6", exact: true }).check();
  132 |   await expect(
  133 |     page.getByRole("radio", { name: "R6", exact: true }),
  134 |   ).toBeChecked();
  135 |   await page.getByRole("button", { name: "Other…", exact: true }).click();
  136 |   await page
  137 |     .getByLabel("Your answer", { exact: true })
  138 |     .fill("Let players choose their rig");
  139 |   await page
  140 |     .getByRole("button", { name: "Update my concept", exact: true })
  141 |     .click();
  142 |   expect(f.project().answers.rig).toBe("Let players choose their rig");
  143 | });
  144 | 
  145 | test("panel pointer and keyboard resize respect bounds and survive reload", async ({
  146 |   page,
  147 | }, info) => {
  148 |   test.skip(
  149 |     info.project.name === "mobile",
  150 |     "The phone uses stacked panels instead of a horizontal divider.",
  151 |   );
  152 |   await page.setViewportSize({ width: 1440, height: 900 });
  153 |   const f = await polishFixture(page, "build");
  154 |   await page.goto("/?project=" + f.id);
  155 |   const separator = page.getByRole("separator", { name: "Resize Takko panel" });
  156 |   const chat = page.getByRole("region", { name: "Project conversation" });
  157 |   await separator.press("Home");
  158 |   await expect(separator).toHaveAttribute("aria-valuenow", "320");
  159 |   await separator.press("ArrowLeft");
  160 |   await expect(separator).toHaveAttribute("aria-valuenow", "336");
  161 |   const box = (await separator.boundingBox())!;
  162 |   await page.mouse.move(box.x + 6, box.y + 100);
  163 |   await page.mouse.down();
  164 |   await page.mouse.move(150, box.y + 150, { steps: 5 });
  165 |   await page.mouse.up();
  166 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  167 |   expect((await chat.boundingBox())!.width).toBe(640);
  168 |   await page.reload();
  169 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  170 |   await page.setViewportSize({ width: 860, height: 640 });
  171 |   expect(
  172 |     (await page
  173 |       .getByRole("region", { name: "Game architecture" })
  174 |       .boundingBox())!.width,
  175 |   ).toBeGreaterThanOrEqual(379);
  176 |   expect((await chat.boundingBox())!.width).toBeGreaterThanOrEqual(320);
  177 |   await expect(
  178 |     page.getByRole("textbox", { name: "Message", exact: true }),
  179 |   ).toBeVisible();
  180 |   await page.screenshot({ path: "docs/results/ui-polish/minimum-desktop.png" });
  181 |   await page.setViewportSize({ width: 1440, height: 900 });
  182 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  183 |   await separator.dblclick();
  184 |   await expect(separator).toHaveAttribute("aria-valuenow", "400");
  185 | });
```