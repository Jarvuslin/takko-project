# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asset-choices.spec.ts >> brief searches automatically, previews geometry and clips, then approves without typing
- Location: tests\browser\asset-choices.spec.ts:4:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: 'Choose assets' }).getByRole('region', { name: 'Fighting animation', exact: true }).getByLabel('Animation time')

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
      - generic [ref=e37]: Workspace/I want a combat game with basic fighting and a target dummy to p
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
          - generic [ref=e56]: 0 systems · 0 connections
          - button "Connections" [ref=e57] [cursor=pointer]
          - button "Add system" [ref=e58] [cursor=pointer]
        - generic "Architecture canvas" [ref=e59]:
          - generic [ref=e60]:
            - strong [ref=e61]: Start with your first game system
            - paragraph [ref=e62]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=e63] [cursor=pointer]
            - generic [ref=e64]: Combat · Inventory · Quests
          - generic [ref=e65]:
            - img "System connections"
        - generic "Canvas controls" [ref=e66]:
          - button "Zoom out canvas" [ref=e67] [cursor=pointer]: −
          - generic [ref=e68]: 100%
          - button "Zoom in canvas" [ref=e69] [cursor=pointer]: +
          - button "Fit" [ref=e70] [cursor=pointer]
          - button "Auto layout" [ref=e71] [cursor=pointer]
      - separator "Resize Takko panel" [ref=e72]
      - heading "I want a combat game with basic fighting and a target dummy to p" [level=1] [ref=e73]
      - region "Project conversation" [ref=e74]:
        - generic [ref=e75]:
          - strong [ref=e77]: Takko
          - generic [ref=e78]: draft
          - button "Latest ↓" [ref=e79] [cursor=pointer]
          - button "History" [ref=e80] [cursor=pointer]
        - generic [ref=e83]:
          - generic [ref=e84]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e86]:
            - article [ref=e87]:
              - generic [ref=e88]:
                - strong [ref=e89]: Takko
                - generic [ref=e90]: r1 · 05:40 PM
              - paragraph [ref=e91]: Saved project. Earlier conversation was not recorded. I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx
          - group [ref=e92]:
            - generic "Preview an animation clip" [ref=e93] [cursor=pointer]
          - generic [ref=e94]:
            - generic [ref=e95]:
              - region "Studio in conversation"
              - group [ref=e96]:
                - generic "Edit original brief" [ref=e97] [cursor=pointer]
              - generic [ref=e98]:
                - button "Shape my idea" [ref=e99] [cursor=pointer]
                - button "Brief approved" [disabled] [ref=e100]
                - button "Configure models" [ref=e101] [cursor=pointer]
              - paragraph [ref=e102]: Shape your idea, then review the plan before building. Uses your planner and generation budget.
              - region "Assets for your brief" [ref=e103]:
                - generic [ref=e104]:
                  - text: ASSETS FOR YOUR BRIEF
                  - heading "Find your game’s look and movement" [level=3] [ref=e105]
                - paragraph [ref=e106]: 6 asset groups · preview a few options and choose what fits.
                - button "Preview & choose assets" [ref=e108] [cursor=pointer]
                - dialog "Choose assets" [ref=e109]:
                  - generic [ref=e110]:
                    - heading "Choose assets" [level=2] [ref=e112]
                    - button "Close dialog" [ref=e113] [cursor=pointer]
                  - generic [ref=e116]:
                    - paragraph [ref=e117]: Preview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.
                    - generic [ref=e118]:
                      - generic [ref=e119]:
                        - text: Studio
                        - combobox "Asset search Studio" [disabled] [ref=e120]:
                          - option "Select Studio"
                          - option "Offline Studio fixture" [selected]
                      - button "Refresh connection" [ref=e121] [cursor=pointer]
                    - region "Practice dummy" [ref=e122]:
                      - heading "Practice dummy" [level=3] [ref=e123]
                      - generic [ref=e124]:
                        - textbox "Search for Practice dummy" [ref=e125]: training dummy
                        - button "Search again" [ref=e126] [cursor=pointer]
                      - generic [ref=e127]:
                        - article [ref=e128]:
                          - strong [ref=e129]: Practice dummy option 1
                          - generic [ref=e130]: "Offline fixture · #101"
                          - link "View on Creator Store" [ref=e131] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/101
                          - button "Reload preview" [ref=e132] [cursor=pointer]
                          - button "Show preview" [ref=e133] [cursor=pointer]
                          - generic [ref=e134]:
                            - radio "Choose Practice dummy option 1" [checked] [ref=e135]
                            - text: Choose Practice dummy option 1
                        - article [ref=e136]:
                          - strong [ref=e137]: Practice dummy option 2
                          - generic [ref=e138]: "Offline fixture · #102"
                          - link "View on Creator Store" [ref=e139] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/102
                          - button "Preview" [ref=e140] [cursor=pointer]
                          - generic [ref=e141]:
                            - radio "Choose Practice dummy option 2" [ref=e142]
                            - text: Choose Practice dummy option 2
                        - article [ref=e143]:
                          - strong [ref=e144]: Practice dummy option 3
                          - generic [ref=e145]: "Offline fixture · #103"
                          - link "View on Creator Store" [ref=e146] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/103
                          - button "Preview" [ref=e147] [cursor=pointer]
                          - generic [ref=e148]:
                            - radio "Choose Practice dummy option 3" [ref=e149]
                            - text: Choose Practice dummy option 3
                      - generic [ref=e150]:
                        - radio "Find later" [ref=e151]
                        - text: Find later
                    - region "Fighting animation" [ref=e152]:
                      - heading "Fighting animation" [level=3] [ref=e153]
                      - generic [ref=e154]:
                        - textbox "Search for Fighting animation" [ref=e155]: combat animation pack
                        - button "Search again" [ref=e156] [cursor=pointer]
                      - generic [ref=e157]:
                        - article [ref=e158]:
                          - strong [ref=e159]: Fighting animation option 1
                          - generic [ref=e160]: "Offline fixture · #111"
                          - link "View on Creator Store" [ref=e161] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/111
                          - button "Reload preview" [ref=e162] [cursor=pointer]
                          - button "Show preview" [expanded] [ref=e163] [cursor=pointer]
                          - generic [ref=e164]:
                            - generic [ref=e165]:
                              - text: Clip
                              - combobox "Clip from Fighting animation option 1" [ref=e166]:
                                - option "Punch · R6"
                                - option "Kick · R6" [selected]
                            - generic [ref=e167]:
                              - generic [ref=e168]:
                                - strong [ref=e169]: Kick
                                - generic "Compatible rig" [ref=e170]:
                                  - generic "Clip rig" [ref=e171]: R6
                              - generic [ref=e172]:
                                - generic [ref=e173]:
                                  - generic: 3D · Paused
                                  - img "Kick on R6" [ref=e174]
                                - generic [ref=e175]:
                                  - button "Play animation" [active] [ref=e176] [cursor=pointer]: Play
                                  - slider "Position in Kick on R6" [ref=e177]: "0.19"
                                  - button "Fullscreen preview" [ref=e178] [cursor=pointer]: ⛶
                                - generic [ref=e179]: Drag to orbit · scroll to zoom · right-drag to pan
                              - generic [ref=e180]: "Roblox asset #502"
                          - generic [ref=e181]:
                            - radio "Choose Fighting animation option 1" [checked] [ref=e182]
                            - text: Choose Fighting animation option 1
                        - article [ref=e183]:
                          - strong [ref=e184]: Fighting animation option 2
                          - generic [ref=e185]: "Offline fixture · #112"
                          - link "View on Creator Store" [ref=e186] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/112
                          - button "Preview" [ref=e187] [cursor=pointer]
                          - generic [ref=e188]:
                            - radio "Choose Fighting animation option 2" [disabled] [ref=e189]
                            - text: Choose Fighting animation option 2
                          - generic [ref=e190]: Load a playable clip to choose this option.
                        - article [ref=e191]:
                          - strong [ref=e192]: Fighting animation option 3
                          - generic [ref=e193]: "Offline fixture · #113"
                          - link "View on Creator Store" [ref=e194] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/113
                          - button "Preview" [ref=e195] [cursor=pointer]
                          - generic [ref=e196]:
                            - radio "Choose Fighting animation option 3" [disabled] [ref=e197]
                            - text: Choose Fighting animation option 3
                          - generic [ref=e198]: Load a playable clip to choose this option.
                      - generic [ref=e199]:
                        - radio "Find later" [ref=e200]
                        - text: Find later
                    - region "Sprint animation" [ref=e201]:
                      - heading "Sprint animation" [level=3] [ref=e202]
                      - generic [ref=e203]:
                        - textbox "Search for Sprint animation" [ref=e204]: sprint animation
                        - button "Search again" [ref=e205] [cursor=pointer]
                      - generic [ref=e206]:
                        - article [ref=e207]:
                          - strong [ref=e208]: Sprint animation option 1
                          - generic [ref=e209]: "Offline fixture · #121"
                          - link "View on Creator Store" [ref=e210] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/121
                          - button "Preview" [ref=e211] [cursor=pointer]
                          - generic [ref=e212]:
                            - radio "Choose Sprint animation option 1" [disabled] [ref=e213]
                            - text: Choose Sprint animation option 1
                          - generic [ref=e214]: Load a playable clip to choose this option.
                        - article [ref=e215]:
                          - strong [ref=e216]: Sprint animation option 2
                          - generic [ref=e217]: "Offline fixture · #122"
                          - link "View on Creator Store" [ref=e218] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/122
                          - button "Preview" [ref=e219] [cursor=pointer]
                          - generic [ref=e220]:
                            - radio "Choose Sprint animation option 2" [disabled] [ref=e221]
                            - text: Choose Sprint animation option 2
                          - generic [ref=e222]: Load a playable clip to choose this option.
                        - article [ref=e223]:
                          - strong [ref=e224]: Sprint animation option 3
                          - generic [ref=e225]: "Offline fixture · #123"
                          - link "View on Creator Store" [ref=e226] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/123
                          - button "Preview" [ref=e227] [cursor=pointer]
                          - generic [ref=e228]:
                            - radio "Choose Sprint animation option 3" [disabled] [ref=e229]
                            - text: Choose Sprint animation option 3
                          - generic [ref=e230]: Load a playable clip to choose this option.
                      - generic [ref=e231]:
                        - radio "Find later" [ref=e232]
                        - text: Find later
                    - region "Walk animation" [ref=e233]:
                      - heading "Walk animation" [level=3] [ref=e234]
                      - generic [ref=e235]:
                        - textbox "Search for Walk animation" [ref=e236]: walk animation
                        - button "Search again" [ref=e237] [cursor=pointer]
                      - generic [ref=e238]:
                        - article [ref=e239]:
                          - strong [ref=e240]: Walk animation option 1
                          - generic [ref=e241]: "Offline fixture · #131"
                          - link "View on Creator Store" [ref=e242] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/131
                          - button "Preview" [ref=e243] [cursor=pointer]
                          - generic [ref=e244]:
                            - radio "Choose Walk animation option 1" [disabled] [ref=e245]
                            - text: Choose Walk animation option 1
                          - generic [ref=e246]: Load a playable clip to choose this option.
                        - article [ref=e247]:
                          - strong [ref=e248]: Walk animation option 2
                          - generic [ref=e249]: "Offline fixture · #132"
                          - link "View on Creator Store" [ref=e250] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/132
                          - button "Preview" [ref=e251] [cursor=pointer]
                          - generic [ref=e252]:
                            - radio "Choose Walk animation option 2" [disabled] [ref=e253]
                            - text: Choose Walk animation option 2
                          - generic [ref=e254]: Load a playable clip to choose this option.
                        - article [ref=e255]:
                          - strong [ref=e256]: Walk animation option 3
                          - generic [ref=e257]: "Offline fixture · #133"
                          - link "View on Creator Store" [ref=e258] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/133
                          - button "Preview" [ref=e259] [cursor=pointer]
                          - generic [ref=e260]:
                            - radio "Choose Walk animation option 3" [disabled] [ref=e261]
                            - text: Choose Walk animation option 3
                          - generic [ref=e262]: Load a playable clip to choose this option.
                      - generic [ref=e263]:
                        - radio "Find later" [ref=e264]
                        - text: Find later
                    - region "Sound effects" [ref=e265]:
                      - heading "Sound effects" [level=3] [ref=e266]
                      - generic [ref=e267]:
                        - textbox "Search for Sound effects" [ref=e268]: punch impact
                        - button "Search again" [ref=e269] [cursor=pointer]
                      - generic [ref=e270]:
                        - article [ref=e271]:
                          - strong [ref=e272]: Sound effects option 1
                          - generic [ref=e273]: "Offline fixture · #141"
                          - link "Listen on Creator Store" [ref=e274] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/141
                          - button "Preview" [ref=e275] [cursor=pointer]
                          - generic [ref=e276]:
                            - radio "Choose Sound effects option 1" [ref=e277]
                            - text: Choose Sound effects option 1
                        - article [ref=e278]:
                          - strong [ref=e279]: Sound effects option 2
                          - generic [ref=e280]: "Offline fixture · #142"
                          - link "Listen on Creator Store" [ref=e281] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/142
                          - button "Preview" [ref=e282] [cursor=pointer]
                          - generic [ref=e283]:
                            - radio "Choose Sound effects option 2" [ref=e284]
                            - text: Choose Sound effects option 2
                        - article [ref=e285]:
                          - strong [ref=e286]: Sound effects option 3
                          - generic [ref=e287]: "Offline fixture · #143"
                          - link "Listen on Creator Store" [ref=e288] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/143
                          - button "Preview" [ref=e289] [cursor=pointer]
                          - generic [ref=e290]:
                            - radio "Choose Sound effects option 3" [ref=e291]
                            - text: Choose Sound effects option 3
                      - generic [ref=e292]:
                        - radio "Find later" [ref=e293]
                        - text: Find later
                    - region "Visual effects" [ref=e294]:
                      - heading "Visual effects" [level=3] [ref=e295]
                      - generic [ref=e296]:
                        - textbox "Search for Visual effects" [ref=e297]: hit impact VFX
                        - button "Search again" [ref=e298] [cursor=pointer]
                      - generic [ref=e299]:
                        - article [ref=e300]:
                          - strong [ref=e301]: Visual effects option 1
                          - generic [ref=e302]: "Offline fixture · #151"
                          - link "View on Creator Store" [ref=e303] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/151
                          - button "Preview" [ref=e304] [cursor=pointer]
                          - generic [ref=e305]:
                            - radio "Choose Visual effects option 1" [ref=e306]
                            - text: Choose Visual effects option 1
                        - article [ref=e307]:
                          - strong [ref=e308]: Visual effects option 2
                          - generic [ref=e309]: "Offline fixture · #152"
                          - link "View on Creator Store" [ref=e310] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/152
                          - button "Preview" [ref=e311] [cursor=pointer]
                          - generic [ref=e312]:
                            - radio "Choose Visual effects option 2" [ref=e313]
                            - text: Choose Visual effects option 2
                        - article [ref=e314]:
                          - strong [ref=e315]: Visual effects option 3
                          - generic [ref=e316]: "Offline fixture · #153"
                          - link "View on Creator Store" [ref=e317] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/153
                          - button "Preview" [ref=e318] [cursor=pointer]
                          - generic [ref=e319]:
                            - radio "Choose Visual effects option 3" [ref=e320]
                            - text: Choose Visual effects option 3
                      - generic [ref=e321]:
                        - radio "Find later" [ref=e322]
                        - text: Find later
                    - generic [ref=e323]:
                      - paragraph [ref=e324]: Choose an asset or Find later in each group.
                      - button "Approve assets & create plan" [disabled] [ref=e325]
            - paragraph [ref=e326]: Your build plan appears after planning.
        - generic [ref=e327]:
          - generic [ref=e328]: Message
          - textbox "Message" [ref=e329]:
            - /placeholder: What would you like to add or change?
          - generic [ref=e330]:
            - button "Browse Marketplace assets" [ref=e331] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e334] [cursor=pointer]
            - button "Presets" [ref=e337] [cursor=pointer]
            - button "Budget for this generation" [ref=e340] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e341]
          - generic [ref=e344]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { assetChoiceFixture } from "./asset-choices-fixture";
  4   | test("brief searches automatically, previews geometry and clips, then approves without typing", async ({
  5   |   page,
  6   | }, info) => {
  7   |   const f = await assetChoiceFixture(page);
  8   |   await expect(
  9   |     page.getByText(
  10  |       "6 asset groups · preview a few options and choose what fits.",
  11  |     ),
  12  |   ).toBeVisible();
  13  |   expect(f.calls).toEqual(["asset-options"]);
  14  |   await page
  15  |     .getByRole("button", { name: "Approve brief", exact: true })
  16  |     .click();
  17  |   await expect(
  18  |     page.getByRole("button", { name: "Brief approved", exact: true }),
  19  |   ).toBeDisabled();
  20  |   await page.getByRole("button", { name: "Preview & choose assets" }).click();
  21  |   const dialog = page.getByRole("dialog", { name: "Choose assets" });
  22  |   const dummy = dialog.getByRole("region", {
  23  |     name: "Practice dummy",
  24  |     exact: true,
  25  |   });
  26  |   await dummy
  27  |     .getByRole("button", { name: "Preview", exact: true })
  28  |     .first()
  29  |     .click();
  30  |   await expect(dummy.locator("canvas")).toBeVisible();
  31  |   await dummy
  32  |     .getByRole("radio", { name: "Choose Practice dummy option 1", exact: true })
  33  |     .check();
  34  |   const combat = dialog.getByRole("region", {
  35  |     name: "Fighting animation",
  36  |     exact: true,
  37  |   });
  38  |   await expect(combat.getByRole("radio").first()).toBeDisabled();
  39  |   await combat
  40  |     .getByRole("button", { name: "Preview", exact: true })
  41  |     .first()
  42  |     .click();
  43  |   await combat
  44  |     .getByLabel("Clip from Fighting animation option 1")
  45  |     .selectOption("Kick");
  46  |   await expect(
  47  |     combat.getByRole("radio", {
  48  |       name: "Choose Fighting animation option 1",
  49  |       exact: true,
  50  |     }),
  51  |   ).toBeChecked();
  52  |   await expect(combat.locator("canvas")).toBeVisible();
  53  |   await combat
  54  |     .locator(".viewport-controls")
  55  |     .getByRole("button", { name: /Pause/ })
  56  |     .click();
> 57  |   await combat.getByLabel("Animation time").fill("0.75");
      |                                             ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  58  |   await page.screenshot({
  59  |     path: `docs/results/asset-choices/options-${info.project.name}.png`,
  60  |   });
  61  |   for (const label of [
  62  |     "Sprint animation",
  63  |     "Walk animation",
  64  |     "Sound effects",
  65  |     "Visual effects",
  66  |   ])
  67  |     await dialog
  68  |       .getByRole("region", { name: label, exact: true })
  69  |       .getByRole("radio", { name: "Find later", exact: true })
  70  |       .check();
  71  |   expect(
  72  |     (await new AxeBuilder({ page }).include(".focused-dialog").analyze())
  73  |       .violations,
  74  |   ).toEqual([]);
  75  |   await page.keyboard.press("Escape");
  76  |   await expect(dialog).toBeHidden();
  77  |   await page.reload();
  78  |   await page.getByRole("button", { name: "Preview & choose assets" }).click();
  79  |   await expect(
  80  |     dialog.getByRole("radio", {
  81  |       name: "Choose Fighting animation option 1",
  82  |       exact: true,
  83  |     }),
  84  |   ).toBeChecked();
  85  |   await dialog
  86  |     .getByRole("button", { name: "Approve assets & create plan" })
  87  |     .click();
  88  |   await expect(
  89  |     page.getByText("Asset choices approved", { exact: true }),
  90  |   ).toBeVisible();
  91  |   await expect(
  92  |     page.getByRole("button", { name: "Approve specification", exact: true }),
  93  |   ).toBeVisible();
  94  |   expect(f.calls.filter((c) => c === "plan")).toHaveLength(1);
  95  |   expect(f.project().assetDiscovery?.choices?.combat.clipKey).toBe("Kick");
  96  |   expect(f.errors).toEqual([]);
  97  | });
  98  | test("dirty and changed briefs invalidate approval and search again", async ({
  99  |   page,
  100 | }) => {
  101 |   const f = await assetChoiceFixture(page);
  102 |   await expect(page.getByText(/6 asset groups/)).toBeVisible();
  103 |   await page
  104 |     .getByRole("button", { name: "Approve brief", exact: true })
  105 |     .click();
  106 |   await page.getByText("Edit original brief", { exact: true }).click();
  107 |   await page
  108 |     .getByLabel("Project request", { exact: true })
  109 |     .fill("A fishing game with a pond and fish models");
  110 |   await page
  111 |     .getByRole("button", { name: "Approve brief", exact: true })
  112 |     .click();
  113 |   await expect(page.getByText(/1 asset groups/)).toBeVisible();
  114 |   expect(f.calls.filter((c) => c === "asset-options")).toHaveLength(2);
  115 |   expect(f.project().revision).toBe(2);
  116 |   expect(f.project().assetDiscovery?.approved).toBeUndefined();
  117 | });
  118 | test("connection failures and empty results give an explicit recovery path", async ({
  119 |   page,
  120 | }) => {
  121 |   await assetChoiceFixture(page);
  122 |   await page.route("**/api/marketplace/studios", (r) =>
  123 |     r.fulfill({ json: { studios: [] } }),
  124 |   );
  125 |   await page.reload();
  126 |   await page.getByRole("button", { name: "Preview & choose assets" }).click();
  127 |   await expect(
  128 |     page.getByRole("dialog").getByText(/Connect Roblox Studio/),
  129 |   ).toBeVisible();
  130 |   await expect(
  131 |     page.getByRole("button", { name: "Find assets", exact: true }),
  132 |   ).toBeDisabled();
  133 |   await expect(
  134 |     page.getByRole("button", { name: "Connect Studio", exact: true }),
  135 |   ).toBeVisible();
  136 | });
  137 | 
```