# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b-foundation.spec.ts >> B icon navigation retains project selection and real model settings
- Location: tests\browser\b-foundation.spec.ts:132:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Project', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByLabel('Project', { exact: true }) with timeout 5000ms
  - waiting for getByLabel('Project', { exact: true })

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
- main:
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - option "Navigation from the B icon rail" [selected]
    - option "Arena architecture dock regression"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Navigation from the B icon rail"
    - option "Arena architecture dock regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "Animation pack preview test"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "Animation pack preview test"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Animation pack preview test"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "Animation accessibility test"
    - option "A combat game"
    - option "A combat game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A combat game"
    - option "A combat game"
    - option "A punch animation preview"
    - option "A combat game with energy"
    - option "A combat game"
    - option "A combat game"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "Orchard"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
    - option "A punch animation preview"
    - option "A cooperative garden game"
    - option "A combat game with energy"
    - option "Orchard"
    - option "Make a farming loop with crop growth, harvesting, selling and a"
    - option "A small puzzle game"
    - option "A cooperative farming game with a harvest shop"
    - option "A Studio recovery fixture"
    - option "A castle puzzle adventure"
    - option "A polling fixture game"
    - option "Build a butter game"
    - option "A cooperative farming game"
    - option "A farming game with a harvest shop"
    - option "Build a cookie scene"
    - option "A Steal a Brainrot style game"
    - option "An arena with short rounds"
    - option "A garden for friends to explore"
    - option "Make a game about a space station"
    - option "Make a pet rescue game"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Make a pet rescue game with trading"
    - option "Asset execution UI regression"
  - region "Game architecture":
    - strong: Game architecture
    - text: draft · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - img "System connections"
    - paragraph: Add your first system, such as Combat, Inventory or Quests. Connect an event to the behavior it should trigger.
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - heading "Navigation from the B icon rail" [level=1]
  - region "Project conversation":
    - strong: Takko
    - text: draft
    - button "Latest ↓"
    - button "History"
    - text: $0.0000 / $2.0000
    - article:
      - strong: You
      - text: Revision 1 · 12:04 PM
      - paragraph: Navigation from the B icon rail
    - group: Preview an animation clip
    - region "Studio in conversation"
    - group:
      - text: Edit original brief
      - heading "Your request" [level=2]
      - text: Revision 1
      - paragraph: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
      - text: Project request
      - textbox "Project request": Navigation from the B icon rail
    - button "Shape my idea"
    - button "Plan this game ↗"
    - button "Configure models"
    - paragraph: Shape your idea into a clear game concept before planning. Uses your planner model and generation budget.
    - group: Build plan · 0 tasks
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - group "Attached assets"
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  53  |         event: "Energy changed",
  54  |         effect: "Update ability meter",
  55  |         kind: "state",
  56  |       },
  57  |     ],
  58  |   };
  59  |   const save = await page.request.post(
  60  |     `/api/projects/${project.id}/architecture`,
  61  |     {
  62  |       data: {
  63  |         id: crypto.randomUUID(),
  64  |         revision: project.revision,
  65  |         architecture,
  66  |       },
  67  |     },
  68  |   );
  69  |   expect(save.ok()).toBeTruthy();
  70  |   await page.goto("/?project=" + project.id);
  71  |   const surface = page.locator(".map-surface");
  72  |   const closedHeight = (await surface.boundingBox())!.height;
  73  |   await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  74  |   const inspector = page.getByRole("complementary", {
  75  |     name: "Architecture inspector",
  76  |   });
  77  |   await expect(inspector).toBeVisible();
  78  |   await expect
  79  |     .poll(async () => {
  80  |       const map = (await surface.boundingBox())!;
  81  |       const dock = (await inspector.boundingBox())!;
  82  |       return map.y + map.height <= dock.y;
  83  |     })
  84  |     .toBe(true);
  85  |   if (info.project.name === "desktop") {
  86  |     expect((await surface.boundingBox())!.height).toBeLessThan(closedHeight);
  87  |     const chat = (await page
  88  |       .getByRole("region", { name: "Project conversation" })
  89  |       .boundingBox())!;
  90  |     expect((await surface.boundingBox())!.width).toBeGreaterThan(
  91  |       chat.width * 1.8,
  92  |     );
  93  |     const cards = await page.locator(".architecture-node").all();
  94  |     for (const label of await page.locator(".architecture-wires text").all()) {
  95  |       const l = (await label.boundingBox())!;
  96  |       for (const card of cards) {
  97  |         const c = (await card.boundingBox())!;
  98  |         expect(
  99  |           l.x + l.width <= c.x ||
  100 |             l.x >= c.x + c.width ||
  101 |             l.y + l.height <= c.y ||
  102 |             l.y >= c.y + c.height,
  103 |         ).toBe(true);
  104 |       }
  105 |     }
  106 |   }
  107 |   await page.getByLabel("System name", { exact: true }).fill("Combat rules");
  108 |   await page.getByRole("button", { name: "Close inspector" }).click();
  109 |   await page
  110 |     .getByRole("button", { name: "Review changes", exact: true })
  111 |     .click();
  112 |   await page
  113 |     .getByRole("button", { name: "Save architecture", exact: true })
  114 |     .click();
  115 |   await expect(
  116 |     page.getByRole("button", { name: "Review changes", exact: true }),
  117 |   ).toBeHidden();
  118 |   const saved = await (
  119 |     await page.request.get("/api/projects/" + project.id)
  120 |   ).json();
  121 |   expect(saved.architecture.nodes[0].name).toBe("Combat rules");
  122 |   expect(saved.architecture.edges).toEqual(architecture.edges);
  123 |   expect(saved.charges).toEqual([]);
  124 |   await page
  125 |     .getByRole("button", { name: "Edit Combat rules", exact: true })
  126 |     .click();
  127 |   await page.screenshot({
  128 |     path: `docs/results/b-foundation/dock-${info.project.name}.png`,
  129 |   });
  130 | });
  131 | 
  132 | test("B icon navigation retains project selection and real model settings", async ({
  133 |   page,
  134 | }, info) => {
  135 |   const p = await (
  136 |     await page.request.post("/api/projects", {
  137 |       data: { request: "Navigation from the B icon rail" },
  138 |     })
  139 |   ).json();
  140 |   await page.goto("/?project=" + p.id);
  141 |   if (info.project.name === "desktop") {
  142 |     await expect(page.locator(".workspace-native")).toBeVisible();
  143 |     await page.getByTitle("Projects", { exact: true }).click();
  144 |     await page.getByRole("searchbox", { name: "Search projects" }).fill(p.name);
  145 |     await page
  146 |       .getByRole("navigation", { name: "Projects", exact: true })
  147 |       .getByRole("button", { name: p.name, exact: true })
  148 |       .click();
  149 |     await expect(page.locator(".project-library")).not.toHaveAttribute(
  150 |       "open",
  151 |       "",
  152 |     );
> 153 |   } else {
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  154 |     await expect(page.getByLabel("Open project", { exact: true })).toBeVisible();
  155 |   }
  156 |   await page
  157 |     .getByRole("navigation", { name: "Workspace", exact: true })
  158 |     .getByRole("button", { name: "Models", exact: true })
  159 |     .click();
  160 |   await expect(page).toHaveURL(/#models$/);
  161 |   await expect(page.locator(".workspace-native")).toHaveCount(0);
  162 | });
  163 | 
```