# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-lab.spec.ts >> sandbox state controls, review and composer remain local and keyboard accessible
- Location: tests\browser\design-lab.spec.ts:85:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Studio state', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - text: Design lab
      - generic [ref=e7]: / Workspace explorations
    - group "Design direction" [ref=e8]:
      - button "A Refined Takko" [pressed] [ref=e9] [cursor=pointer]:
        - generic [ref=e10]: A
        - generic [ref=e11]: Refined Takko
      - button "B AI Native" [ref=e12] [cursor=pointer]:
        - generic [ref=e13]: B
        - generic [ref=e14]: AI Native
      - button "C Game Dev" [ref=e15] [cursor=pointer]:
        - generic [ref=e16]: C
        - generic [ref=e17]: Game Dev
    - button "Design & states" [ref=e18] [cursor=pointer]
  - generic [ref=e21]:
    - complementary [ref=e22]:
      - generic [ref=e23]:
        - strong [ref=e25]: takko
        - generic [ref=e26]: /
      - button "Arena Personal workspace" [ref=e27] [cursor=pointer]:
        - generic [ref=e31]:
          - generic [ref=e32]: Arena
          - generic [ref=e33]: Personal workspace
      - navigation "Design lab navigation" [ref=e36]:
        - paragraph [ref=e37]: WORKSPACE
        - button "Architecture 3" [ref=e38] [cursor=pointer]:
          - generic [ref=e41]: Architecture
          - generic [ref=e42]: "3"
        - button "Assets" [ref=e43] [cursor=pointer]
        - button "Activity" [ref=e47] [cursor=pointer]
        - button "Marketplace" [ref=e52] [cursor=pointer]
        - button "Models" [ref=e56] [cursor=pointer]
        - button "Presets" [ref=e60] [cursor=pointer]
      - generic [ref=e64]:
        - generic [ref=e65]: IN THIS PROJECT
        - generic [ref=e66]: First playable
        - generic [ref=e68]: 3 systems · 2 connections
      - generic [ref=e69]:
        - button "Workspace settings" [ref=e70] [cursor=pointer]
        - generic [ref=e74]:
          - generic [ref=e75]: YL
          - generic [ref=e76]:
            - generic [ref=e77]: Your workspace
            - generic [ref=e78]: Local · private
    - main [ref=e81]:
      - generic [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]: Arena
          - generic [ref=e85]: /
          - generic [ref=e86]: First playable
          - generic [ref=e87]: Draft
        - generic [ref=e88]:
          - button "Connect Studio" [ref=e89] [cursor=pointer]
          - button "Version history" [ref=e93] [cursor=pointer]
      - generic [ref=e96]:
        - region "Architecture design" [ref=e97]:
          - generic [ref=e98]:
            - generic [ref=e99]:
              - text: YOUR GAME, CONNECTED
              - heading "Game architecture" [level=1] [ref=e100]
              - paragraph [ref=e101]: Confirmed hits become energy. Energy unlocks abilities.
            - button "Review changes 3" [ref=e102] [cursor=pointer]:
              - text: Review changes
              - generic [ref=e105]: "3"
          - generic [ref=e106]:
            - region "Game architecture" [ref=e107]:
              - generic [ref=e109]:
                - button "Build details" [ref=e110] [cursor=pointer]: Build
                - button "Source details" [ref=e111] [cursor=pointer]: Source
                - button "Studio details" [ref=e112] [cursor=pointer]: Studio
              - generic [ref=e113]:
                - generic [ref=e114]: 3 systems · 2 connections
                - button "Connections" [ref=e115] [cursor=pointer]
                - button "Add system" [ref=e116] [cursor=pointer]
              - generic "Architecture canvas" [ref=e117]:
                - generic [ref=e118]:
                  - img "System connections":
                    - generic: Hit confirmed
                    - generic: Energy changed
                  - generic [ref=e119]:
                    - button "Edit Combat" [ref=e120] [cursor=pointer]:
                      - generic [ref=e121]: Server · trusted logic
                      - strong [ref=e122]: Combat
                      - generic [ref=e123]: Ready to test
                    - generic [ref=e124]:
                      - button "Receive at Combat" [ref=e125] [cursor=pointer]: ● In
                      - button "Connect from Combat" [ref=e126] [cursor=pointer]: Out ●
                  - generic [ref=e127]:
                    - button "Edit Energy" [ref=e128] [cursor=pointer]:
                      - generic [ref=e129]: Server · trusted logic
                      - strong [ref=e130]: Energy
                      - generic [ref=e131]: Needs attention
                    - generic [ref=e132]:
                      - button "Receive at Energy" [ref=e133] [cursor=pointer]: ● In
                      - button "Connect from Energy" [ref=e134] [cursor=pointer]: Out ●
                  - generic [ref=e135]:
                    - button "Edit Abilities" [ref=e136] [cursor=pointer]:
                      - generic [ref=e137]: Player · presentation
                      - strong [ref=e138]: Abilities
                      - generic [ref=e139]: Unchanged
                    - generic [ref=e140]:
                      - button "Receive at Abilities" [ref=e141] [cursor=pointer]: ● In
                      - button "Connect from Abilities" [ref=e142] [cursor=pointer]: Out ●
              - generic "Canvas controls" [ref=e143]:
                - button "Zoom out canvas" [ref=e144] [cursor=pointer]: −
                - generic [ref=e145]: 49%
                - button "Zoom in canvas" [ref=e146] [cursor=pointer]: +
                - button "Fit" [ref=e147] [cursor=pointer]
                - button "Auto layout" [ref=e148] [cursor=pointer]
            - generic:
              - generic: System
              - generic: Updating
              - generic: → Event or state
          - generic [ref=e149]:
            - generic [ref=e153]:
              - text: THE GAME LOOP
              - heading "Every hit moves you closer." [level=3] [ref=e154]
              - paragraph [ref=e155]: Server confirms a hit → +10 energy → Ability ready at 100
            - button "Discuss the game loop" [ref=e156] [cursor=pointer]
          - generic [ref=e159]:
            - generic [ref=e160]: Local design sandbox
            - generic [ref=e162]: Drag to move · Scroll to zoom
        - separator "Resize agent panel" [ref=e163]
        - complementary "Takko agent" [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]:
              - strong [ref=e169]: Takko
              - generic [ref=e170]: Your building partner
            - button "Conversation history" [ref=e171] [cursor=pointer]
          - generic [ref=e174]:
            - generic [ref=e175]: Build a small arena where confirmed hits charge an ability.
            - heading "Your arena is taking shape." [level=2] [ref=e176]
            - paragraph [ref=e177]: Combat now charges Energy on confirmed hits. I’m connecting the meter so you can see when the ability is ready.
            - button "Energy update needs attention Combat is preserved · Review details" [ref=e179] [cursor=pointer]:
              - generic [ref=e183]:
                - generic [ref=e184]: Energy update needs attention
                - generic [ref=e185]: Combat is preserved · Review details
            - generic [ref=e189]:
              - generic [ref=e190]:
                - strong [ref=e191]: WalkLoopAnimation
                - generic "Compatible rig" [ref=e192]:
                  - generic "Clip rig" [ref=e193]: R6
              - generic [ref=e194]:
                - generic [ref=e195]:
                  - generic: 3D · Live loop
                  - img "WalkLoopAnimation on R6" [ref=e196]
                - generic [ref=e197]:
                  - button "Pause animation" [ref=e198] [cursor=pointer]: Pause
                  - slider "Position in WalkLoopAnimation on R6" [ref=e199]: "0.5"
                  - button "Fullscreen preview" [ref=e200] [cursor=pointer]: ⛶
                - generic [ref=e201]: Drag to orbit · scroll to zoom · right-drag to pan
              - generic [ref=e202]: "Roblox #180426354 · Browser preview"
            - button "Add a training dummy ↗" [ref=e203] [cursor=pointer]:
              - generic [ref=e206]: Add a training dummy
              - generic [ref=e207]: ↗
          - generic [ref=e208]:
            - textbox "Message Takko" [ref=e209]:
              - /placeholder: What should we build next?
            - generic [ref=e210]:
              - button "Attach an asset" [ref=e211] [cursor=pointer]
              - button "Game builder" [ref=e214] [cursor=pointer]
              - button "Send sandbox message" [disabled] [ref=e219]
          - generic [ref=e222]:
            - generic [ref=e223]: Local demo · no model calls
            - generic [ref=e224]: Enter to send
  - dialog "Design & states" [ref=e225]:
    - banner [ref=e226]:
      - generic [ref=e227]:
        - text: DESIGN LAB
        - heading "Design & states" [level=2] [ref=e228]
      - button "Close dialog" [active] [ref=e229] [cursor=pointer]
    - generic [ref=e232]:
      - generic [ref=e233]: A / Refined Takko
      - heading "Familiar, with room to focus." [level=3] [ref=e235]
      - paragraph [ref=e236]: Clear panels, considered spacing and a calmer version of the workspace you know.
      - generic [ref=e237]: More visible structure. Less change to your existing workflow.
    - generic [ref=e238]:
      - generic [ref=e239]:
        - text: Generation state
        - combobox "Generation state" [ref=e240]:
          - option "queued"
          - option "working"
          - option "finished"
          - option "failed" [selected]
      - generic [ref=e241]:
        - text: Studio state
        - combobox "Studio state" [ref=e242]:
          - option "Disconnected" [selected]
          - option "Connecting"
          - option "Connected"
          - option "Syncing"
          - option "Error"
      - generic [ref=e243]:
        - checkbox "Show viewport loading state" [ref=e244]
        - text: Show viewport loading state
      - generic [ref=e245]:
        - checkbox "No pending changes" [ref=e246]
        - text: No pending changes
    - paragraph [ref=e247]: These controls demonstrate product states. They never connect to Studio or call a model. Graph edits and messages stay in the sandbox.
    - generic [ref=e248]:
      - text: Motion language
      - paragraph [ref=e249]: 140 ms feedback · 220 ms disclosures · 280 ms panels
      - text: Reduced motion disables transitions and pauses autoplay. Drag the panel divider or use its arrow keys to resize.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test("design lab switches real workspaces without reload, API calls or losing graph edits", async ({
  4   |   page,
  5   | }) => {
  6   |   await page.setViewportSize({ width: 1440, height: 900 });
  7   |   const requests: string[] = [];
  8   |   page.on("request", (request) => {
  9   |     if (new URL(request.url()).pathname.startsWith("/api/"))
  10  |       requests.push(request.url());
  11  |   });
  12  |   await page.goto("/design-lab");
  13  |   const time = await page.evaluate(() => performance.timeOrigin);
  14  |   await expect(
  15  |     page.getByRole("button", { name: "Edit Combat", exact: true }),
  16  |   ).toBeVisible();
  17  |   await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  18  |   await page
  19  |     .getByLabel("System name", { exact: true })
  20  |     .fill("Combat sandbox edit");
  21  |   await page.getByRole("button", { name: "Close inspector" }).click();
  22  |   for (const [letter, label] of [
  23  |     ["B", "AI Native"],
  24  |     ["C", "Game Dev"],
  25  |     ["A", "Refined Takko"],
  26  |   ]) {
  27  |     await page
  28  |       .getByRole("button", { name: `${letter} ${label}`, exact: true })
  29  |       .click();
  30  |     await expect(page.locator(".design-lab")).toHaveClass(
  31  |       `design-lab dl-${letter}`,
  32  |     );
  33  |     await expect(
  34  |       page.getByRole("button", {
  35  |         name: "Edit Combat sandbox edit",
  36  |         exact: true,
  37  |       }),
  38  |     ).toBeVisible();
  39  |     const surface = await page.locator(".map-surface").boundingBox();
  40  |     for (const node of await page.locator(".architecture-node").all()) {
  41  |       const box = await node.boundingBox();
  42  |       expect(box!.x).toBeGreaterThanOrEqual(surface!.x);
  43  |       expect(box!.x + box!.width).toBeLessThanOrEqual(
  44  |         surface!.x + surface!.width + 1,
  45  |       );
  46  |       expect(box!.y + box!.height).toBeLessThanOrEqual(
  47  |         surface!.y + surface!.height + 1,
  48  |       );
  49  |     }
  50  |   }
  51  |   expect(await page.evaluate(() => performance.timeOrigin)).toBe(time);
  52  |   expect(requests).toEqual([]);
  53  | });
  54  | 
  55  | test("design lab renders actual imported 3D tracks and playback survives direction switching", async ({
  56  |   page,
  57  | }) => {
  58  |   await page.setViewportSize({ width: 1440, height: 900 });
  59  |   await page.goto("/design-lab");
  60  |   const canvas = page.locator('canvas[data-renderer="webgl"]');
  61  |   await expect(canvas).toHaveAttribute("data-triangles", /^[1-9]\d*$/);
  62  |   const first = await canvas.getAttribute("data-time");
  63  |   await expect.poll(() => canvas.getAttribute("data-time")).not.toBe(first);
  64  |   await page
  65  |     .getByRole("button", { name: "Pause animation", exact: true })
  66  |     .click();
  67  |   await expect(
  68  |     page.getByRole("button", { name: "Play animation", exact: true }),
  69  |   ).toBeVisible();
  70  |   await page.getByRole("button", { name: "B AI Native", exact: true }).click();
  71  |   await expect(
  72  |     page.getByRole("button", { name: "Play animation", exact: true }),
  73  |   ).toBeVisible();
  74  |   const camera = await canvas.getAttribute("data-camera");
  75  |   await canvas.focus();
  76  |   await canvas.press("ArrowLeft");
  77  |   await expect.poll(() => canvas.getAttribute("data-camera")).not.toBe(camera);
  78  |   const bounds = await page
  79  |     .getByRole("button", { name: "Fullscreen preview" })
  80  |     .boundingBox();
  81  |   const composer = await page.locator(".dl-composer").boundingBox();
  82  |   expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(composer!.y);
  83  | });
  84  | 
  85  | test("sandbox state controls, review and composer remain local and keyboard accessible", async ({
  86  |   page,
  87  | }) => {
  88  |   const requests: string[] = [];
  89  |   page.on("request", (r) => {
  90  |     if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url());
  91  |   });
  92  |   await page.goto("/design-lab");
  93  |   await page
  94  |     .getByRole("button", { name: "Design & states", exact: true })
  95  |     .click();
  96  |   await expect(page.getByRole("dialog")).toBeVisible();
  97  |   await page.getByLabel("Generation state").selectOption("failed");
  98  |   await page
  99  |     .getByLabel("Studio state", { exact: true })
> 100 |     .selectOption("Syncing");
      |      ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  101 |   await page.getByRole("button", { name: "Close dialog" }).click();
  102 |   await expect(
  103 |     page.getByRole("button", { name: /Energy update needs attention/ }),
  104 |   ).toBeVisible();
  105 |   await expect(
  106 |     page.getByRole("button", { name: "Syncing", exact: true }),
  107 |   ).toBeVisible();
  108 |   await page
  109 |     .getByRole("button", { name: "Review changes 3", exact: true })
  110 |     .click();
  111 |   await page.getByRole("button", { name: "Mark reviewed in sandbox" }).click();
  112 |   await expect(
  113 |     page.getByRole("button", { name: "Review changes 0", exact: true }),
  114 |   ).toBeVisible();
  115 |   await page
  116 |     .getByRole("textbox", { name: "Message Takko" })
  117 |     .fill("Add a training dummy");
  118 |   await page.getByRole("button", { name: "Attach an asset" }).click();
  119 |   await page.getByRole("button", { name: "Close dialog" }).click();
  120 |   await expect(
  121 |     page.getByRole("textbox", { name: "Message Takko" }),
  122 |   ).toHaveValue("Add a training dummy");
  123 |   await page.getByRole("textbox", { name: "Message Takko" }).press("Enter");
  124 |   await expect(page.locator(".dl-local-message")).toContainText(
  125 |     "Add a training dummy",
  126 |   );
  127 |   expect(requests).toEqual([]);
  128 | });
  129 | 
  130 | test("design sandbox respects reduced motion and does not load on production routes", async ({
  131 |   page,
  132 | }) => {
  133 |   await page.emulateMedia({ reducedMotion: "reduce" });
  134 |   await page.goto("/design-lab/");
  135 |   await expect(
  136 |     page.getByRole("button", { name: "Play animation", exact: true }),
  137 |   ).toBeVisible();
  138 |   await expect(page.locator(".dl-spinner").first()).toHaveCSS(
  139 |     "animation-name",
  140 |     "none",
  141 |   );
  142 |   await page.goto("/");
  143 |   await expect(page.locator(".design-lab")).toHaveCount(0);
  144 |   expect(
  145 |     await page.evaluate(
  146 |       () =>
  147 |         performance
  148 |           .getEntriesByType("resource")
  149 |           .filter((r) => /DesignLab|walk\.json|design-lab\.css/.test(r.name))
  150 |           .length,
  151 |     ),
  152 |   ).toBe(0);
  153 | });
  154 | 
```