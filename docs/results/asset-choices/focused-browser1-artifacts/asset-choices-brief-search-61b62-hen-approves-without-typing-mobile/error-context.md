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
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [ref=e13] [cursor=pointer]
    - navigation "Workspace" [ref=e17]:
      - button "Models" [ref=e18] [cursor=pointer]
      - button "Presets" [ref=e22] [cursor=pointer]
  - main [ref=e26]:
    - generic [ref=e27]:
      - text: Your projects
      - combobox "Open project" [ref=e28]:
        - option "New project"
        - option "I want a combat game with basic fighting and a target dummy to p" [selected]
    - generic [ref=e29]:
      - region "Game architecture" [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - strong [ref=e33]: Game architecture
            - generic [ref=e34]: draft · Game architecture
          - generic [ref=e35]:
            - button "Build details" [ref=e36] [cursor=pointer]: Build
            - button "Source details" [ref=e37] [cursor=pointer]: Source
            - button "Studio details" [ref=e38] [cursor=pointer]: Studio
        - generic [ref=e39]:
          - generic [ref=e40]: 0 systems · 0 connections
          - button "Connections" [ref=e41] [cursor=pointer]
          - button "Add system" [ref=e42] [cursor=pointer]
        - generic "Architecture canvas" [ref=e43]:
          - generic [ref=e44]:
            - strong [ref=e45]: Start with your first game system
            - paragraph [ref=e46]: Describe your game to Takko, or add a system using the toolbar.
            - button "Ask Takko" [ref=e47] [cursor=pointer]
          - generic [ref=e48]:
            - img "System connections"
        - generic "Canvas controls" [ref=e49]:
          - button "Zoom out canvas" [ref=e50] [cursor=pointer]: −
          - generic [ref=e51]: 100%
          - button "Zoom in canvas" [ref=e52] [cursor=pointer]: +
          - button "Fit" [ref=e53] [cursor=pointer]
          - button "Auto layout" [ref=e54] [cursor=pointer]
      - heading "I want a combat game with basic fighting and a target dummy to p" [level=1] [ref=e55]
      - region "Project conversation" [ref=e56]:
        - generic [ref=e57]:
          - strong [ref=e59]: Takko
          - generic [ref=e60]: draft
          - button "Latest ↓" [ref=e61] [cursor=pointer]
          - button "History" [ref=e62] [cursor=pointer]
        - generic [ref=e65]:
          - generic [ref=e66]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e68]:
            - article [ref=e69]:
              - generic [ref=e70]:
                - strong [ref=e71]: Takko
                - generic [ref=e72]: r1 · 05:41 PM
              - paragraph [ref=e73]: Saved project. Earlier conversation was not recorded. I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx
          - group [ref=e74]:
            - generic "Preview an animation clip" [ref=e75] [cursor=pointer]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - region "Studio in conversation"
              - group [ref=e78]:
                - generic "Edit original brief" [ref=e79] [cursor=pointer]
              - generic [ref=e80]:
                - button "Shape my idea" [ref=e81] [cursor=pointer]
                - button "Brief approved" [disabled] [ref=e82]
                - button "Configure models" [ref=e83] [cursor=pointer]
              - paragraph [ref=e84]: Shape your idea, then review the plan before building. Uses your planner and generation budget.
              - region "Assets for your brief" [ref=e85]:
                - generic [ref=e86]:
                  - text: ASSETS FOR YOUR BRIEF
                  - heading "Find your game’s look and movement" [level=3] [ref=e87]
                - paragraph [ref=e88]: 6 asset groups · preview a few options and choose what fits.
                - button "Preview & choose assets" [ref=e90] [cursor=pointer]
                - dialog "Choose assets" [ref=e91]:
                  - generic [ref=e92]:
                    - heading "Choose assets" [level=2] [ref=e94]
                    - button "Close dialog" [ref=e95] [cursor=pointer]
                  - generic [ref=e98]:
                    - paragraph [ref=e99]: Preview options, choose one per group, or mark it Find later. Search results are suggestions. You approve the final references.
                    - generic [ref=e100]:
                      - generic [ref=e101]:
                        - text: Studio
                        - combobox "Asset search Studio" [disabled] [ref=e102]:
                          - option "Select Studio"
                          - option "Offline Studio fixture" [selected]
                      - button "Refresh connection" [ref=e103] [cursor=pointer]
                    - region "Practice dummy" [ref=e104]:
                      - heading "Practice dummy" [level=3] [ref=e105]
                      - generic [ref=e106]:
                        - textbox "Search for Practice dummy" [ref=e107]: training dummy
                        - button "Search again" [ref=e108] [cursor=pointer]
                      - generic [ref=e109]:
                        - article [ref=e110]:
                          - strong [ref=e111]: Practice dummy option 1
                          - generic [ref=e112]: "Offline fixture · #101"
                          - link "View on Creator Store" [ref=e113] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/101
                          - button "Reload preview" [ref=e114] [cursor=pointer]
                          - button "Show preview" [ref=e115] [cursor=pointer]
                          - generic [ref=e116]:
                            - radio "Choose Practice dummy option 1" [checked] [ref=e117]
                            - text: Choose Practice dummy option 1
                        - article [ref=e118]:
                          - strong [ref=e119]: Practice dummy option 2
                          - generic [ref=e120]: "Offline fixture · #102"
                          - link "View on Creator Store" [ref=e121] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/102
                          - button "Preview" [ref=e122] [cursor=pointer]
                          - generic [ref=e123]:
                            - radio "Choose Practice dummy option 2" [ref=e124]
                            - text: Choose Practice dummy option 2
                        - article [ref=e125]:
                          - strong [ref=e126]: Practice dummy option 3
                          - generic [ref=e127]: "Offline fixture · #103"
                          - link "View on Creator Store" [ref=e128] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/103
                          - button "Preview" [ref=e129] [cursor=pointer]
                          - generic [ref=e130]:
                            - radio "Choose Practice dummy option 3" [ref=e131]
                            - text: Choose Practice dummy option 3
                      - generic [ref=e132]:
                        - radio "Find later" [ref=e133]
                        - text: Find later
                    - region "Fighting animation" [ref=e134]:
                      - heading "Fighting animation" [level=3] [ref=e135]
                      - generic [ref=e136]:
                        - textbox "Search for Fighting animation" [ref=e137]: combat animation pack
                        - button "Search again" [ref=e138] [cursor=pointer]
                      - generic [ref=e139]:
                        - article [ref=e140]:
                          - strong [ref=e141]: Fighting animation option 1
                          - generic [ref=e142]: "Offline fixture · #111"
                          - link "View on Creator Store" [ref=e143] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/111
                          - button "Reload preview" [ref=e144] [cursor=pointer]
                          - button "Show preview" [expanded] [ref=e145] [cursor=pointer]
                          - generic [ref=e146]:
                            - generic [ref=e147]:
                              - text: Clip
                              - combobox "Clip from Fighting animation option 1" [ref=e148]:
                                - option "Punch · R6"
                                - option "Kick · R6" [selected]
                            - generic [ref=e149]:
                              - generic [ref=e150]:
                                - strong [ref=e151]: Kick
                                - generic "Compatible rig" [ref=e152]:
                                  - generic "Clip rig" [ref=e153]: R6
                              - generic [ref=e154]:
                                - generic [ref=e155]:
                                  - generic: 3D · Paused
                                  - img "Kick on R6" [ref=e156]
                                - generic [ref=e157]:
                                  - button "Play animation" [active] [ref=e158] [cursor=pointer]: Play
                                  - slider "Position in Kick on R6" [ref=e159]: "0.18"
                                  - button "Fullscreen preview" [ref=e160] [cursor=pointer]: ⛶
                                - generic [ref=e161]: Drag to orbit · scroll to zoom · right-drag to pan
                              - generic [ref=e162]: "Roblox asset #502"
                          - generic [ref=e163]:
                            - radio "Choose Fighting animation option 1" [checked] [ref=e164]
                            - text: Choose Fighting animation option 1
                        - article [ref=e165]:
                          - strong [ref=e166]: Fighting animation option 2
                          - generic [ref=e167]: "Offline fixture · #112"
                          - link "View on Creator Store" [ref=e168] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/112
                          - button "Preview" [ref=e169] [cursor=pointer]
                          - generic [ref=e170]:
                            - radio "Choose Fighting animation option 2" [disabled] [ref=e171]
                            - text: Choose Fighting animation option 2
                          - generic [ref=e172]: Load a playable clip to choose this option.
                        - article [ref=e173]:
                          - strong [ref=e174]: Fighting animation option 3
                          - generic [ref=e175]: "Offline fixture · #113"
                          - link "View on Creator Store" [ref=e176] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/113
                          - button "Preview" [ref=e177] [cursor=pointer]
                          - generic [ref=e178]:
                            - radio "Choose Fighting animation option 3" [disabled] [ref=e179]
                            - text: Choose Fighting animation option 3
                          - generic [ref=e180]: Load a playable clip to choose this option.
                      - generic [ref=e181]:
                        - radio "Find later" [ref=e182]
                        - text: Find later
                    - region "Sprint animation" [ref=e183]:
                      - heading "Sprint animation" [level=3] [ref=e184]
                      - generic [ref=e185]:
                        - textbox "Search for Sprint animation" [ref=e186]: sprint animation
                        - button "Search again" [ref=e187] [cursor=pointer]
                      - generic [ref=e188]:
                        - article [ref=e189]:
                          - strong [ref=e190]: Sprint animation option 1
                          - generic [ref=e191]: "Offline fixture · #121"
                          - link "View on Creator Store" [ref=e192] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/121
                          - button "Preview" [ref=e193] [cursor=pointer]
                          - generic [ref=e194]:
                            - radio "Choose Sprint animation option 1" [disabled] [ref=e195]
                            - text: Choose Sprint animation option 1
                          - generic [ref=e196]: Load a playable clip to choose this option.
                        - article [ref=e197]:
                          - strong [ref=e198]: Sprint animation option 2
                          - generic [ref=e199]: "Offline fixture · #122"
                          - link "View on Creator Store" [ref=e200] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/122
                          - button "Preview" [ref=e201] [cursor=pointer]
                          - generic [ref=e202]:
                            - radio "Choose Sprint animation option 2" [disabled] [ref=e203]
                            - text: Choose Sprint animation option 2
                          - generic [ref=e204]: Load a playable clip to choose this option.
                        - article [ref=e205]:
                          - strong [ref=e206]: Sprint animation option 3
                          - generic [ref=e207]: "Offline fixture · #123"
                          - link "View on Creator Store" [ref=e208] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/123
                          - button "Preview" [ref=e209] [cursor=pointer]
                          - generic [ref=e210]:
                            - radio "Choose Sprint animation option 3" [disabled] [ref=e211]
                            - text: Choose Sprint animation option 3
                          - generic [ref=e212]: Load a playable clip to choose this option.
                      - generic [ref=e213]:
                        - radio "Find later" [ref=e214]
                        - text: Find later
                    - region "Walk animation" [ref=e215]:
                      - heading "Walk animation" [level=3] [ref=e216]
                      - generic [ref=e217]:
                        - textbox "Search for Walk animation" [ref=e218]: walk animation
                        - button "Search again" [ref=e219] [cursor=pointer]
                      - generic [ref=e220]:
                        - article [ref=e221]:
                          - strong [ref=e222]: Walk animation option 1
                          - generic [ref=e223]: "Offline fixture · #131"
                          - link "View on Creator Store" [ref=e224] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/131
                          - button "Preview" [ref=e225] [cursor=pointer]
                          - generic [ref=e226]:
                            - radio "Choose Walk animation option 1" [disabled] [ref=e227]
                            - text: Choose Walk animation option 1
                          - generic [ref=e228]: Load a playable clip to choose this option.
                        - article [ref=e229]:
                          - strong [ref=e230]: Walk animation option 2
                          - generic [ref=e231]: "Offline fixture · #132"
                          - link "View on Creator Store" [ref=e232] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/132
                          - button "Preview" [ref=e233] [cursor=pointer]
                          - generic [ref=e234]:
                            - radio "Choose Walk animation option 2" [disabled] [ref=e235]
                            - text: Choose Walk animation option 2
                          - generic [ref=e236]: Load a playable clip to choose this option.
                        - article [ref=e237]:
                          - strong [ref=e238]: Walk animation option 3
                          - generic [ref=e239]: "Offline fixture · #133"
                          - link "View on Creator Store" [ref=e240] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/133
                          - button "Preview" [ref=e241] [cursor=pointer]
                          - generic [ref=e242]:
                            - radio "Choose Walk animation option 3" [disabled] [ref=e243]
                            - text: Choose Walk animation option 3
                          - generic [ref=e244]: Load a playable clip to choose this option.
                      - generic [ref=e245]:
                        - radio "Find later" [ref=e246]
                        - text: Find later
                    - region "Sound effects" [ref=e247]:
                      - heading "Sound effects" [level=3] [ref=e248]
                      - generic [ref=e249]:
                        - textbox "Search for Sound effects" [ref=e250]: punch impact
                        - button "Search again" [ref=e251] [cursor=pointer]
                      - generic [ref=e252]:
                        - article [ref=e253]:
                          - strong [ref=e254]: Sound effects option 1
                          - generic [ref=e255]: "Offline fixture · #141"
                          - link "Listen on Creator Store" [ref=e256] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/141
                          - button "Preview" [ref=e257] [cursor=pointer]
                          - generic [ref=e258]:
                            - radio "Choose Sound effects option 1" [ref=e259]
                            - text: Choose Sound effects option 1
                        - article [ref=e260]:
                          - strong [ref=e261]: Sound effects option 2
                          - generic [ref=e262]: "Offline fixture · #142"
                          - link "Listen on Creator Store" [ref=e263] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/142
                          - button "Preview" [ref=e264] [cursor=pointer]
                          - generic [ref=e265]:
                            - radio "Choose Sound effects option 2" [ref=e266]
                            - text: Choose Sound effects option 2
                        - article [ref=e267]:
                          - strong [ref=e268]: Sound effects option 3
                          - generic [ref=e269]: "Offline fixture · #143"
                          - link "Listen on Creator Store" [ref=e270] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/143
                          - button "Preview" [ref=e271] [cursor=pointer]
                          - generic [ref=e272]:
                            - radio "Choose Sound effects option 3" [ref=e273]
                            - text: Choose Sound effects option 3
                      - generic [ref=e274]:
                        - radio "Find later" [ref=e275]
                        - text: Find later
                    - region "Visual effects" [ref=e276]:
                      - heading "Visual effects" [level=3] [ref=e277]
                      - generic [ref=e278]:
                        - textbox "Search for Visual effects" [ref=e279]: hit impact VFX
                        - button "Search again" [ref=e280] [cursor=pointer]
                      - generic [ref=e281]:
                        - article [ref=e282]:
                          - strong [ref=e283]: Visual effects option 1
                          - generic [ref=e284]: "Offline fixture · #151"
                          - link "View on Creator Store" [ref=e285] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/151
                          - button "Preview" [ref=e286] [cursor=pointer]
                          - generic [ref=e287]:
                            - radio "Choose Visual effects option 1" [ref=e288]
                            - text: Choose Visual effects option 1
                        - article [ref=e289]:
                          - strong [ref=e290]: Visual effects option 2
                          - generic [ref=e291]: "Offline fixture · #152"
                          - link "View on Creator Store" [ref=e292] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/152
                          - button "Preview" [ref=e293] [cursor=pointer]
                          - generic [ref=e294]:
                            - radio "Choose Visual effects option 2" [ref=e295]
                            - text: Choose Visual effects option 2
                        - article [ref=e296]:
                          - strong [ref=e297]: Visual effects option 3
                          - generic [ref=e298]: "Offline fixture · #153"
                          - link "View on Creator Store" [ref=e299] [cursor=pointer]:
                            - /url: https://create.roblox.com/store/asset/153
                          - button "Preview" [ref=e300] [cursor=pointer]
                          - generic [ref=e301]:
                            - radio "Choose Visual effects option 3" [ref=e302]
                            - text: Choose Visual effects option 3
                      - generic [ref=e303]:
                        - radio "Find later" [ref=e304]
                        - text: Find later
                    - generic [ref=e305]:
                      - paragraph [ref=e306]: Choose an asset or Find later in each group.
                      - button "Approve assets & create plan" [disabled] [ref=e307]
            - paragraph [ref=e308]: Your build plan appears after planning.
        - generic [ref=e309]:
          - generic [ref=e310]: Message
          - textbox "Message" [ref=e311]:
            - /placeholder: What would you like to add or change?
          - generic [ref=e312]:
            - button "Browse Marketplace assets" [ref=e313] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e316] [cursor=pointer]
            - button "Presets" [ref=e319] [cursor=pointer]
            - button "Budget for this generation" [ref=e322] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e323]
          - generic [ref=e326]: Enter to send · Shift + Enter for a new line
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
> 57  |   await combat.getByRole("slider", { name: /Position in/ }).fill("0.75");
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