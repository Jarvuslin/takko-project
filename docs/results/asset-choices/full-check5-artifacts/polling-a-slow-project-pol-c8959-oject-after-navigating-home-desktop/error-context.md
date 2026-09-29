# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: polling.spec.ts >> a slow project poll cannot overlap or restore a project after navigating home
- Location: tests\browser\polling.spec.ts:3:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 3
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
      - generic [ref=e37]: Workspace/A polling fixture game
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
      - heading "A polling fixture game" [level=1] [ref=e73]
      - region "Project conversation" [ref=e74]:
        - generic [ref=e75]:
          - strong [ref=e77]: Takko
          - generic [ref=e78]: draft
          - button "Latest ↓" [ref=e79] [cursor=pointer]
          - button "History" [ref=e80] [cursor=pointer]
        - generic [ref=e83]:
          - generic [ref=e84]: $0.0000 / $0.2500
          - generic "Saved conversation" [ref=e86]:
            - article [ref=e87]:
              - generic [ref=e88]:
                - strong [ref=e89]: You
                - generic [ref=e90]: r1 · 10:13 PM
              - paragraph [ref=e91]: A polling fixture game
          - group [ref=e92]:
            - generic "Preview an animation clip" [ref=e93] [cursor=pointer]
          - generic [ref=e94]:
            - generic [ref=e95]:
              - region "Studio in conversation"
              - group [ref=e96]:
                - generic "Edit original brief" [ref=e97] [cursor=pointer]
              - generic [ref=e98]:
                - button "Plan this game ↗" [ref=e99] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e100]: ↗
                - button "Configure models" [ref=e101] [cursor=pointer]
            - paragraph [ref=e102]: Your build plan appears after planning.
          - dialog "Studio details" [ref=e103]:
            - generic [ref=e104]:
              - heading "Studio details" [level=2] [ref=e106]
              - button "Close dialog" [active] [ref=e107] [cursor=pointer]
            - generic [ref=e111]:
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - heading "See what actually plays." [level=2] [ref=e114]
                  - paragraph [ref=e115]: Connect Roblox Studio to apply your game and run its acceptance scenarios.
                - generic [ref=e116]: Awaiting connection
              - generic [ref=e117]:
                - generic [ref=e118]:
                  - heading "Inspect the real game in Studio" [level=3] [ref=e119]
                  - paragraph [ref=e120]: Play in Studio to check animation, sound, controls and visual quality.
                - complementary [ref=e121]:
                  - heading "Connect the plugin" [level=3] [ref=e122]
                  - list [ref=e123]:
                    - listitem [ref=e124]:
                      - link "Download Takko.rbxmx" [ref=e125] [cursor=pointer]:
                        - /url: /api/studio/plugin
                      - text: . Insert it into Studio and use “Save as Local Plugin” on the script.
                    - listitem [ref=e126]: Open a new Studio session after installing, then open the Takko toolbar panel. Allow its local HTTP connection when Studio asks.
                    - listitem [ref=e127]: Press Connect to Takko. The plugin pairs with this local app automatically; your session appears below.
                  - button "Show pairing token" [ref=e128] [cursor=pointer]
                  - paragraph [ref=e129]: Use a saved test place. Review generated scripts before applying. Press Reconnect after restarting Takko.
        - generic [ref=e130]:
          - generic [ref=e131]: Message
          - textbox "Message" [ref=e132]:
            - /placeholder: What would you like to add or change?
          - generic [ref=e133]:
            - button "Browse Marketplace assets" [ref=e134] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e137] [cursor=pointer]
            - button "Presets" [ref=e140] [cursor=pointer]
            - button "Budget for this generation" [ref=e143] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e144]
          - generic [ref=e147]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  1  | import { expect, test } from "./workspace-fixture";
  2  | 
  3  | test("a slow project poll cannot overlap or restore a project after navigating home", async ({
  4  |   page,
  5  | }) => {
  6  |   const p = await (
  7  |     await page.request.post("/api/projects", {
  8  |       data: { request: "A polling fixture game" },
  9  |     })
  10 |   ).json();
  11 |   let count = 0;
  12 |   let release!: () => void;
  13 |   const held = new Promise<void>((resolve) => {
  14 |     release = resolve;
  15 |   });
  16 |   await page.route("**/api/status", (route) =>
  17 |     route.fulfill({ json: { studios: [] } }),
  18 |   );
  19 |   await page.route("**/api/projects/" + p.id, async (route) => {
  20 |     count++;
  21 |     if (count > 1) await held;
  22 |     await route.fulfill({ json: p });
  23 |   });
  24 |   await page.goto("/?project=" + p.id);
  25 |   await page.getByRole("button", { name: "Studio details", exact: true }).click();
  26 |   await expect.poll(() => count).toBe(2);
  27 |   await page.waitForTimeout(3200);
> 28 |   expect(count).toBe(2);
     |                 ^ Error: expect(received).toBe(expected) // Object.is equality
  29 |   await page.keyboard.press("Escape");
  30 |   await page.getByRole("link", { name: "Takko home" }).click();
  31 |   await expect(page.getByLabel("Game idea")).toBeVisible();
  32 |   release();
  33 |   await page.waitForTimeout(500);
  34 |   await expect(page.getByLabel("Game idea")).toBeVisible();
  35 | });
  36 | 
  37 | test("slow polls do not overlap and a transient failure clears after recovery", async ({
  38 |   page,
  39 | }) => {
  40 |   let count = 0;
  41 |   let release!: () => void;
  42 |   const held = new Promise<void>((resolve) => {
  43 |     release = resolve;
  44 |   });
  45 |   await page.route("**/api/status", async (route) => {
  46 |     count++;
  47 |     if (count === 1) {
  48 |       await held;
  49 |       await route.fulfill({
  50 |         status: 503,
  51 |         json: { error: "Temporary poll failure" },
  52 |       });
  53 |     } else await route.fulfill({ json: { studios: [] } });
  54 |   });
  55 |   await page.goto("/");
  56 |   await expect.poll(() => count).toBe(1);
  57 |   // Hold longer than two old interval ticks. There must still be only one request.
  58 |   await page.waitForTimeout(3200);
  59 |   expect(count).toBe(1);
  60 |   release();
  61 |   await expect(page.getByRole("alert")).toHaveText(/Temporary poll failure/);
  62 |   await expect(page.getByRole("alert")).toHaveCount(0);
  63 | });
  64 | 
  65 | test("a successful poll does not clear an action error", async ({ page }) => {
  66 |   let count = 0;
  67 |   await page.route("**/api/status", (route) => {
  68 |     count++;
  69 |     return route.fulfill({ json: { studios: [] } });
  70 |   });
  71 |   await page.route("**/api/projects", (route) =>
  72 |     route.request().method() === "POST"
  73 |       ? route.fulfill({ status: 500, json: { error: "Creation failed" } })
  74 |       : route.fulfill({ json: [] }),
  75 |   );
  76 |   await page.goto("/");
  77 |   await page.getByLabel("Game idea").fill("A test game with coins");
  78 |   await page.getByRole("button", { name: /Create project/i }).click();
  79 |   await expect(page.getByRole("alert")).toContainText("Creation failed");
  80 |   const previous = count;
  81 |   await expect.poll(() => count).toBeGreaterThan(previous);
  82 |   await expect(page.getByRole("alert")).toContainText("Creation failed");
  83 | });
  84 | 
```