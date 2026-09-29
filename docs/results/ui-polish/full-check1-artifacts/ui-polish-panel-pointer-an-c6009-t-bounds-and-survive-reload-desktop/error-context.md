# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-polish.spec.ts >> panel pointer and keyboard resize respect bounds and survive reload
- Location: tests\browser\ui-polish.spec.ts:132:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('separator', { name: 'Resize Takko panel' })
Expected: "640"
Received: "336"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" getByRole('separator', { name: 'Resize Takko panel' }) with timeout 5000ms
  - waiting for getByRole('separator', { name: 'Resize Takko panel' })
    13 × locator resolved to <div tabindex="0" role="separator" aria-valuemin="320" aria-valuemax="640" aria-valuenow="336" class="workspace-divider" aria-orientation="vertical" aria-label="Resize Takko panel" aria-valuetext="336 pixels wide" aria-controls="takko-agent-panel" title="Drag to resize · Arrow keys to adjust · Double-click to reset"></div>
       - unexpected value "336"

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
  - group: Projects
  - link "Download plugin":
    - /url: /api/studio/plugin
  - text: Local workspace
- main:
  - text: "Workspace/UI QA: Practice punches and kicks in a training yard. Offline fi"
  - button "Connect to Studio"
  - button "Models"
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - 'option "UI QA: Practice punches and kicks in a training yard. Offline fi" [selected]'
  - region "Game architecture":
    - text: Your game, connected
    - strong: Game architecture
    - text: review · Saved architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 2 systems · 1 connections
    - button "Connections"
    - button "Add system"
    - img "System connections": Hit confirmed
    - button "Edit Combat":
      - text: Server · trusted logic
      - strong: Combat
      - text: Design
    - button "Receive at Combat": ● In
    - button "Connect from Combat": Out ●
    - button "Edit Energy":
      - text: Server · trusted logic
      - strong: Energy
      - text: Design
    - button "Receive at Energy": ● In
    - button "Connect from Energy": Out ●
    - button "Zoom out canvas": −
    - text: 115%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
    - button "Review changes" [disabled]
  - separator "Resize Takko panel"
  - 'heading "UI QA: Practice punches and kicks in a training yard. Offline fi" [level=1]'
  - region "Project conversation":
    - strong: Takko
    - text: review
    - button "Latest ↓"
    - button "History"
    - text: $0.0000 / $2.0000
    - article:
      - strong: You
      - text: r1 · 03:00 PM
      - paragraph: "UI QA: Practice punches and kicks in a training yard. Offline fixture."
    - group: Preview an animation clip
    - button "Review how the systems interact and identify anything the player cannot complete."
    - region "Studio in conversation"
    - group: Edit original brief
    - button "Update & replan ↗"
    - button "Configure models"
    - text: EXPERIENCE DIRECTION
    - 'heading "UI QA: Practice punches and kicks in a training yard. Offline fixture." [level=2]'
    - paragraph: Readable silhouettes and warm lighting
    - group:
      - text: Specification · 1 requirements
      - heading "What the game needs" [level=2]
      - text: 1 requirements
      - article:
        - text: mechanic
        - 'heading "UI QA: Practice punches and kicks in a training yard. Offline fixture." [level=3]'
        - paragraph: The core gameplay state is observable.
        - text: From your request · required
    - button "Approve specification"
    - group: Build plan 1 of 1 complete
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - group "Attached assets"
    - button "Browse Marketplace assets": Marketplace
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  53  |   ).toBeFocused();
  54  |   await page.reload();
  55  |   await expect(page.locator(".clarifications")).toContainText("Fists + kicks");
  56  |   await page
  57  |     .getByRole("button", { name: "Update my concept", exact: true })
  58  |     .click();
  59  |   await expect(page.locator(".saved-clarifications")).toContainText(
  60  |     "Fists + kicks",
  61  |   );
  62  |   expect(f.calls).toEqual(["PATCH", "concept"]);
  63  |   await page.screenshot({
  64  |     path: `docs/results/ui-polish/receipt-${info.project.name}.png`,
  65  |   });
  66  |   await page.locator(".saved-clarifications").getByRole("button", { name: "Edit answers" }).click();
  67  |   await dialog.getByLabel("Your answer", { exact: true }).fill("Fists only");
  68  |   await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  69  |   await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  70  |   await dialog.getByRole("button", { name: "Confirm answers", exact: true }).click();
  71  |   await expect(page.getByRole("button", { name: "Use this concept & plan" })).toBeDisabled();
  72  |   await page.getByRole("button", { name: "Update concept", exact: true }).click();
  73  |   expect(f.project().answers.combat).toBe("Fists only");
  74  |   expect(f.calls).toEqual(["PATCH", "concept", "PATCH", "concept"]);
  75  | });
  76  | 
  77  | test("dialog custom input, focus loop, Escape and restored draft work without submission", async ({
  78  |   page,
  79  | }) => {
  80  |   const f = await polishFixture(page);
  81  |   await page.goto("/?project=" + f.id);
  82  |   await page
  83  |     .getByRole("button", { name: "Answer questions", exact: true })
  84  |     .click();
  85  |   const d = page.getByRole("dialog");
  86  |   await d.getByRole("button", { name: "Other…", exact: true }).click();
  87  |   await d
  88  |     .getByLabel("Your answer", { exact: true })
  89  |     .fill("A staff with a defensive kick");
  90  |   await d.getByRole("button", { name: "Continue", exact: true }).press("Tab");
  91  |   await expect(
  92  |     d.getByRole("button", { name: "Close dialog", exact: true }),
  93  |   ).toBeFocused();
  94  |   await d
  95  |     .getByRole("button", { name: "Close dialog", exact: true })
  96  |     .press("Shift+Tab");
  97  |   await expect(
  98  |     d.getByRole("button", { name: "Continue", exact: true }),
  99  |   ).toBeFocused();
  100 |   await page.keyboard.press("Escape");
  101 |   await expect(d).toBeHidden();
  102 |   await expect(
  103 |     page.getByRole("button", { name: "Edit answers", exact: true }),
  104 |   ).toBeFocused();
  105 |   await page.getByRole("button", { name: "Edit answers", exact: true }).click();
  106 |   await expect(d.getByLabel("Your answer", { exact: true })).toHaveValue(
  107 |     "A staff with a defensive kick",
  108 |   );
  109 |   expect(f.calls).toEqual([]);
  110 | });
  111 | 
  112 | test("one simple decision stays inline and custom answers remain available", async ({
  113 |   page,
  114 | }) => {
  115 |   const f = await polishFixture(page, "simple");
  116 |   await page.goto("/?project=" + f.id);
  117 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  118 |   await page.getByRole("radio", { name: "R6", exact: true }).check();
  119 |   await expect(
  120 |     page.getByRole("radio", { name: "R6", exact: true }),
  121 |   ).toBeChecked();
  122 |   await page.getByRole("button", { name: "Other…", exact: true }).click();
  123 |   await page
  124 |     .getByLabel("Your answer", { exact: true })
  125 |     .fill("Let players choose their rig");
  126 |   await page
  127 |     .getByRole("button", { name: "Update my concept", exact: true })
  128 |     .click();
  129 |   expect(f.project().answers.rig).toBe("Let players choose their rig");
  130 | });
  131 | 
  132 | test("panel pointer and keyboard resize respect bounds and survive reload", async ({
  133 |   page,
  134 | }, info) => {
  135 |   test.skip(
  136 |     info.project.name === "mobile",
  137 |     "The phone uses stacked panels instead of a horizontal divider.",
  138 |   );
  139 |   await page.setViewportSize({ width: 1440, height: 900 });
  140 |   const f = await polishFixture(page, "build");
  141 |   await page.goto("/?project=" + f.id);
  142 |   const separator = page.getByRole("separator", { name: "Resize Takko panel" });
  143 |   const chat = page.getByRole("region", { name: "Project conversation" });
  144 |   await separator.press("Home");
  145 |   await expect(separator).toHaveAttribute("aria-valuenow", "320");
  146 |   await separator.press("ArrowLeft");
  147 |   await expect(separator).toHaveAttribute("aria-valuenow", "336");
  148 |   const box = (await separator.boundingBox())!;
  149 |   await page.mouse.move(box.x + 6, box.y + 100);
  150 |   await page.mouse.down();
  151 |   await page.mouse.move(150, box.y + 150, { steps: 5 });
  152 |   await page.mouse.up();
> 153 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
      |                           ^ Error: expect(locator).toHaveAttribute(expected) failed
  154 |   expect((await chat.boundingBox())!.width).toBe(640);
  155 |   await page.reload();
  156 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  157 |   await page.setViewportSize({ width: 860, height: 640 });
  158 |   expect(
  159 |     (await page
  160 |       .getByRole("region", { name: "Game architecture" })
  161 |       .boundingBox())!.width,
  162 |   ).toBeGreaterThanOrEqual(379);
  163 |   expect((await chat.boundingBox())!.width).toBeGreaterThanOrEqual(320);
  164 |   await expect(
  165 |     page.getByRole("textbox", { name: "Message", exact: true }),
  166 |   ).toBeVisible();
  167 |   await page.screenshot({ path: "docs/results/ui-polish/minimum-desktop.png" });
  168 |   await page.setViewportSize({ width: 1440, height: 900 });
  169 |   await expect(separator).toHaveAttribute("aria-valuenow", "640");
  170 |   await separator.dblclick();
  171 |   await expect(separator).toHaveAttribute("aria-valuenow", "400");
  172 | });
  173 | 
  174 | test("inspector, source, Studio, plan and composer stay usable", async ({
  175 |   page,
  176 | }, info) => {
  177 |   const f = await polishFixture(page, "build");
  178 |   await page.goto("/?project=" + f.id);
  179 |   await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  180 |   const inspector = page.getByRole("complementary", {
  181 |     name: "Architecture inspector",
  182 |   });
  183 |   await expect(
  184 |     inspector.getByLabel("System name", { exact: true }),
  185 |   ).toBeVisible();
  186 |   await expect(inspector.getByLabel("From", { exact: true })).toHaveCount(0);
  187 |   await inspector
  188 |     .getByRole("button", { name: "Connections", exact: true })
  189 |     .click();
  190 |   await expect(inspector.getByLabel("From", { exact: true })).toBeVisible();
  191 |   await inspector.getByRole("button", { name: "Close inspector" }).click();
  192 |   for (const name of ["Source", "Studio", "Build"]) {
  193 |     await page
  194 |       .getByRole("button", { name: name + " details", exact: true })
  195 |       .click();
  196 |     await expect(
  197 |       page.getByRole("dialog", { name: name + " details" }),
  198 |     ).toBeVisible();
  199 |     await page
  200 |       .getByRole("button", { name: "Close dialog", exact: true })
  201 |       .click();
  202 |   }
  203 |   await page.locator(".compact-plan > summary").click();
  204 |   await expect(page.locator(".compact-plan")).toContainText("Complete");
  205 |   const composer = page.getByRole("textbox", { name: "Message", exact: true });
  206 |   await composer.fill("Keep the training yard small");
  207 |   await composer.press("Shift+Enter");
  208 |   await composer.press("x");
  209 |   await expect(composer).toHaveValue("Keep the training yard small\nx");
  210 |   expect(f.calls).toEqual([]);
  211 |   expect(
  212 |     await page.evaluate(
  213 |       () => document.documentElement.scrollWidth <= innerWidth,
  214 |     ),
  215 |   ).toBe(true);
  216 |   await page.screenshot({
  217 |     path: `docs/results/ui-polish/workspace-${info.project.name}.png`,
  218 |   });
  219 | });
  220 | 
```