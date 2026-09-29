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
    - group "Design direction" [ref=e5]:
      - button "A Refined Takko" [pressed] [ref=e6] [cursor=pointer]:
        - generic [ref=e7]: A
        - generic [ref=e8]: Refined Takko
      - button "B AI Native" [ref=e9] [cursor=pointer]:
        - generic [ref=e10]: B
        - generic [ref=e11]: AI Native
      - button "C Game Dev" [ref=e12] [cursor=pointer]:
        - generic [ref=e13]: C
        - generic [ref=e14]: Game Dev
    - button "Design & states" [ref=e15] [cursor=pointer]
  - main [ref=e19]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]: Arena
        - generic [ref=e23]: /
        - generic [ref=e24]: First playable
      - generic [ref=e25]:
        - button "Connect Studio" [ref=e26] [cursor=pointer]
        - button "Version history" [ref=e30] [cursor=pointer]
    - generic [ref=e33]:
      - region "Architecture design" [ref=e34]:
        - generic [ref=e35]:
          - heading "Game architecture" [level=1] [ref=e37]
          - button "Review changes 3" [ref=e38] [cursor=pointer]:
            - text: Review changes
            - generic [ref=e41]: "3"
        - region "Game architecture" [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]: 3 systems · 2 connections
            - button "Connections" [ref=e46] [cursor=pointer]
            - button "Add system" [ref=e47] [cursor=pointer]
          - generic "Architecture canvas" [ref=e48]:
            - generic [ref=e49]:
              - img "System connections":
                - generic: Hit confirmed
                - generic: Energy changed
              - generic [ref=e50]:
                - button "Edit Combat" [ref=e51] [cursor=pointer]:
                  - generic [ref=e52]: Server · trusted logic
                  - strong [ref=e53]: Combat
                  - generic [ref=e54]: Ready to test
                - generic [ref=e55]:
                  - button "Receive at Combat" [ref=e56] [cursor=pointer]: ● In
                  - button "Connect from Combat" [ref=e57] [cursor=pointer]: Out ●
              - generic [ref=e58]:
                - button "Edit Energy" [ref=e59] [cursor=pointer]:
                  - generic [ref=e60]: Server · trusted logic
                  - strong [ref=e61]: Energy
                  - generic [ref=e62]: Needs attention
                - generic [ref=e63]:
                  - button "Receive at Energy" [ref=e64] [cursor=pointer]: ● In
                  - button "Connect from Energy" [ref=e65] [cursor=pointer]: Out ●
              - generic [ref=e66]:
                - button "Edit Abilities" [ref=e67] [cursor=pointer]:
                  - generic [ref=e68]: Player · presentation
                  - strong [ref=e69]: Abilities
                  - generic [ref=e70]: Unchanged
                - generic [ref=e71]:
                  - button "Receive at Abilities" [ref=e72] [cursor=pointer]: ● In
                  - button "Connect from Abilities" [ref=e73] [cursor=pointer]: Out ●
          - generic "Canvas controls" [ref=e74]:
            - button "Zoom out canvas" [ref=e75] [cursor=pointer]: −
            - generic [ref=e76]: 30%
            - button "Zoom in canvas" [ref=e77] [cursor=pointer]: +
            - button "Fit" [ref=e78] [cursor=pointer]
            - button "Auto layout" [ref=e79] [cursor=pointer]
      - complementary "Takko agent" [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - strong [ref=e84]: Takko
            - generic [ref=e85]: Your building partner
          - button "Conversation history" [ref=e86] [cursor=pointer]
        - generic [ref=e89]:
          - generic [ref=e90]: Build a small arena where confirmed hits charge an ability.
          - heading "Your arena is taking shape." [level=2] [ref=e91]
          - paragraph [ref=e92]: Combat now charges Energy on confirmed hits. I’m connecting the meter so you can see when the ability is ready.
          - button "Energy update needs attention Combat is preserved · Review details" [ref=e94] [cursor=pointer]:
            - generic [ref=e98]:
              - generic [ref=e99]: Energy update needs attention
              - generic [ref=e100]: Combat is preserved · Review details
          - generic [ref=e104]:
            - generic [ref=e105]:
              - strong [ref=e106]: WalkLoopAnimation
              - generic "Compatible rig" [ref=e107]:
                - generic "Clip rig" [ref=e108]: R6
            - generic [ref=e109]: 3D preview loads when visible
            - generic [ref=e110]: "Roblox #180426354 · Browser preview"
          - button "Add a training dummy ↗" [ref=e111] [cursor=pointer]:
            - generic [ref=e114]: Add a training dummy
            - generic [ref=e115]: ↗
        - generic [ref=e116]:
          - textbox "Message Takko" [ref=e117]:
            - /placeholder: What should we build next?
          - generic [ref=e118]:
            - button "Attach an asset" [ref=e119] [cursor=pointer]
            - button "Game builder" [ref=e122] [cursor=pointer]
            - button "Send sandbox message" [disabled] [ref=e127]
        - generic [ref=e130]:
          - generic [ref=e131]: Local demo · no model calls
          - generic [ref=e132]: Enter to send
  - dialog "Design & states" [ref=e133]:
    - banner [ref=e134]:
      - generic [ref=e135]:
        - text: DESIGN LAB
        - heading "Design & states" [level=2] [ref=e136]
      - button "Close dialog" [active] [ref=e137] [cursor=pointer]
    - generic [ref=e140]:
      - generic [ref=e141]: A / Refined Takko
      - heading "Familiar, with room to focus." [level=3] [ref=e143]
      - paragraph [ref=e144]: Clear panels, considered spacing and a calmer version of the workspace you know.
      - generic [ref=e145]: More visible structure. Less change to your existing workflow.
    - generic [ref=e146]:
      - generic [ref=e147]:
        - text: Generation state
        - combobox "Generation state" [ref=e148]:
          - option "queued"
          - option "working"
          - option "finished"
          - option "failed" [selected]
      - generic [ref=e149]:
        - text: Studio state
        - combobox "Studio state" [ref=e150]:
          - option "Disconnected" [selected]
          - option "Connecting"
          - option "Connected"
          - option "Syncing"
          - option "Error"
      - generic [ref=e151]:
        - checkbox "Show viewport loading state" [ref=e152]
        - text: Show viewport loading state
      - generic [ref=e153]:
        - checkbox "No pending changes" [ref=e154]
        - text: No pending changes
    - paragraph [ref=e155]: These controls demonstrate product states. They never connect to Studio or call a model. Graph edits and messages stay in the sandbox.
    - generic [ref=e156]:
      - text: Motion language
      - paragraph [ref=e157]: 140 ms feedback · 220 ms disclosures · 280 ms panels
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
  99  |     .getByRole("combobox", { name: "Studio state", exact: true })
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