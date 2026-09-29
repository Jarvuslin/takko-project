# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-lab.spec.ts >> design sandbox respects reduced motion and does not load on production routes
- Location: tests\browser\design-lab.spec.ts:130:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Play animation', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Play animation', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Play animation', exact: true })

```

```yaml
- banner:
  - group "Design direction":
    - button "A Refined Takko" [pressed]
    - button "B AI Native"
    - button "C Game Dev"
  - button "Design & states"
- main:
  - text: Arena / First playable
  - button "Connect Studio"
  - button "Version history"
  - region "Architecture design":
    - heading "Game architecture" [level=1]
    - button "Review changes 3"
    - region "Game architecture":
      - text: 3 systems · 2 connections
      - button "Connections"
      - button "Add system"
      - img "System connections": Hit confirmed Energy changed
      - button "Edit Combat":
        - text: Server · trusted logic
        - strong: Combat
        - text: Ready to test
      - button "Receive at Combat": ● In
      - button "Connect from Combat": Out ●
      - button "Edit Energy":
        - text: Server · trusted logic
        - strong: Energy
        - text: Updating…
      - button "Receive at Energy": ● In
      - button "Connect from Energy": Out ●
      - button "Edit Abilities":
        - text: Player · presentation
        - strong: Abilities
        - text: Unchanged
      - button "Receive at Abilities": ● In
      - button "Connect from Abilities": Out ●
      - button "Zoom out canvas": −
      - text: 30%
      - button "Zoom in canvas": +
      - button "Fit"
      - button "Auto layout"
  - complementary "Takko agent":
    - strong: Takko
    - text: Your building partner
    - button "Conversation history"
    - text: Build a small arena where confirmed hits charge an ability.
    - heading "Your arena is taking shape." [level=2]
    - paragraph: Combat now charges Energy on confirmed hits. I’m connecting the meter so you can see when the ability is ready.
    - button "Updating Energy Combat complete · Connecting charge meter"
    - strong: WalkLoopAnimation
    - text: "R6 3D preview loads when visible Roblox #180426354 · Browser preview"
    - button "Add a training dummy ↗"
    - textbox "Message Takko":
      - /placeholder: What should we build next?
    - button "Attach an asset"
    - button "Game builder"
    - button "Send sandbox message" [disabled]
    - text: Local demo · no model calls Enter to send
```

# Test source

```ts
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
  100 |     .selectOption("Syncing");
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
> 137 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
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