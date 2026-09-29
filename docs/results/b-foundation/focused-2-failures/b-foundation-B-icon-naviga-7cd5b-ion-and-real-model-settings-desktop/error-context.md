# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b-foundation.spec.ts >> B icon navigation retains project selection and real model settings
- Location: tests\browser\b-foundation.spec.ts:134:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('navigation', { name: 'Projects', exact: true }).getByRole('button', { name: 'Navigation from the B icon rail', exact: true }) resolved to 3 elements:
    1) <button aria-current="page" class="project-link selected">…</button> aka getByRole('button', { name: 'Navigation from the B icon' }).first()
    2) <button class="project-link">…</button> aka getByRole('button', { name: 'Navigation from the B icon' }).nth(1)
    3) <button class="project-link">…</button> aka getByRole('button', { name: 'Navigation from the B icon' }).nth(2)

Call log:
  - waiting for getByRole('navigation', { name: 'Projects', exact: true }).getByRole('button', { name: 'Navigation from the B icon rail', exact: true })

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
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: Search projects
          - searchbox "Search projects" [active] [ref=e33]: Navigation from the B icon rail
        - generic [ref=e34]:
          - text: Recent projects
          - generic [ref=e35]: "567"
        - navigation "Projects" [ref=e36]:
          - button "Navigation from the B icon rail" [ref=e37] [cursor=pointer]
          - button "Navigation from the B icon rail" [ref=e39] [cursor=pointer]
          - button "Navigation from the B icon rail" [ref=e41] [cursor=pointer]
    - link "Download plugin" [ref=e44] [cursor=pointer]:
      - /url: /api/studio/plugin
  - main [ref=e48]:
    - generic [ref=e49]:
      - generic [ref=e50]: Workspace/Navigation from the B icon rail
      - generic [ref=e51]:
        - button "Connect to Studio" [ref=e52] [cursor=pointer]
        - button "Models" [ref=e54] [cursor=pointer]
    - generic [ref=e57]:
      - region "Game architecture" [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: Your game, connected
            - strong [ref=e62]: Game architecture
            - generic [ref=e63]: draft · Game architecture
          - generic [ref=e64]:
            - button "Build details" [ref=e65] [cursor=pointer]: Build
            - button "Source details" [ref=e66] [cursor=pointer]: Source
            - button "Studio details" [ref=e67] [cursor=pointer]: Studio
        - generic [ref=e68]:
          - generic [ref=e69]: 0 systems · 0 connections
          - button "Connections" [ref=e70] [cursor=pointer]
          - button "Add system" [ref=e71] [cursor=pointer]
        - generic "Architecture canvas" [ref=e72]:
          - generic [ref=e73]:
            - img "System connections"
            - paragraph [ref=e74]: Add your first system, such as Combat, Inventory or Quests.Connect an event to the behavior it should trigger.
        - generic "Canvas controls" [ref=e75]:
          - button "Zoom out canvas" [ref=e76] [cursor=pointer]: −
          - generic [ref=e77]: 100%
          - button "Zoom in canvas" [ref=e78] [cursor=pointer]: +
          - button "Fit" [ref=e79] [cursor=pointer]
          - button "Auto layout" [ref=e80] [cursor=pointer]
      - heading "Navigation from the B icon rail" [level=1] [ref=e81]
      - region "Project conversation" [ref=e82]:
        - generic [ref=e83]:
          - strong [ref=e85]: Takko
          - generic [ref=e86]: draft
          - button "Latest ↓" [ref=e87] [cursor=pointer]
          - button "History" [ref=e88] [cursor=pointer]
        - generic [ref=e91]:
          - generic [ref=e92]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e94]:
            - article [ref=e95]:
              - generic [ref=e96]:
                - strong [ref=e97]: You
                - generic [ref=e98]: Revision 1 · 12:06 PM
              - paragraph [ref=e99]: Navigation from the B icon rail
          - group [ref=e100]:
            - generic "Preview an animation clip" [ref=e101] [cursor=pointer]
          - generic [ref=e102]:
            - generic [ref=e103]:
              - region "Studio in conversation"
              - group [ref=e104]:
                - generic "Edit original brief" [ref=e105] [cursor=pointer]
                - generic [ref=e106]:
                  - heading "Your request" [level=2] [ref=e107]
                  - generic [ref=e108]: Revision 1
                - paragraph [ref=e109]: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
                - generic [ref=e110]: Project request
                - textbox "Project request" [ref=e111]: Navigation from the B icon rail
              - generic [ref=e112]:
                - button "Plan this game ↗" [ref=e113] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e114]: ↗
                - button "Configure models" [ref=e115] [cursor=pointer]
            - group [ref=e116]:
              - generic "Build plan · 0 tasks" [ref=e117] [cursor=pointer]
        - generic [ref=e118]:
          - generic [ref=e119]: Message
          - textbox "Message" [ref=e120]:
            - /placeholder: What would you like to add or change?
          - group "Attached assets"
          - generic [ref=e121]:
            - button "Browse Marketplace assets" [ref=e122] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e125] [cursor=pointer]
            - button "Presets" [ref=e128] [cursor=pointer]
            - button "Budget for this generation" [ref=e131] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e132]
          - generic [ref=e135]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  50  |         id: "meter",
  51  |         from: "energy",
  52  |         to: "hud",
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
  96  |       const wires = (await page.locator(".architecture-wires").boundingBox())!;
  97  |       expect(l.y + l.height).toBeLessThanOrEqual(wires.y + wires.height);
  98  |       for (const card of cards) {
  99  |         const c = (await card.boundingBox())!;
  100 |         expect(
  101 |           l.x + l.width <= c.x ||
  102 |             l.x >= c.x + c.width ||
  103 |             l.y + l.height <= c.y ||
  104 |             l.y >= c.y + c.height,
  105 |         ).toBe(true);
  106 |       }
  107 |     }
  108 |   }
  109 |   await page.getByLabel("System name", { exact: true }).fill("Combat rules");
  110 |   await page.getByRole("button", { name: "Close inspector" }).click();
  111 |   await page
  112 |     .getByRole("button", { name: "Review changes", exact: true })
  113 |     .click();
  114 |   await page
  115 |     .getByRole("button", { name: "Save architecture", exact: true })
  116 |     .click();
  117 |   await expect(
  118 |     page.getByRole("button", { name: "Review changes", exact: true }),
  119 |   ).toBeHidden();
  120 |   const saved = await (
  121 |     await page.request.get("/api/projects/" + project.id)
  122 |   ).json();
  123 |   expect(saved.architecture.nodes[0].name).toBe("Combat rules");
  124 |   expect(saved.architecture.edges).toEqual(architecture.edges);
  125 |   expect(saved.charges).toEqual([]);
  126 |   await page
  127 |     .getByRole("button", { name: "Edit Combat rules", exact: true })
  128 |     .click();
  129 |   await page.screenshot({
  130 |     path: `docs/results/b-foundation/dock-${info.project.name}.png`,
  131 |   });
  132 | });
  133 | 
  134 | test("B icon navigation retains project selection and real model settings", async ({
  135 |   page,
  136 | }, info) => {
  137 |   const p = await (
  138 |     await page.request.post("/api/projects", {
  139 |       data: { request: "Navigation from the B icon rail" },
  140 |     })
  141 |   ).json();
  142 |   await page.goto("/?project=" + p.id);
  143 |   if (info.project.name === "desktop") {
  144 |     await expect(page.locator(".workspace-native")).toBeVisible();
  145 |     await page.getByTitle("Projects", { exact: true }).click();
  146 |     await page.getByRole("searchbox", { name: "Search projects" }).fill(p.name);
  147 |     await page
  148 |       .getByRole("navigation", { name: "Projects", exact: true })
  149 |       .getByRole("button", { name: p.name, exact: true })
> 150 |       .click();
      |        ^ Error: locator.click: Error: strict mode violation: getByRole('navigation', { name: 'Projects', exact: true }).getByRole('button', { name: 'Navigation from the B icon rail', exact: true }) resolved to 3 elements:
  151 |     await expect(page.locator(".project-library")).not.toHaveAttribute(
  152 |       "open",
  153 |       "",
  154 |     );
  155 |   } else {
  156 |     await expect(
  157 |       page.getByLabel("Open project", { exact: true }),
  158 |     ).toBeVisible();
  159 |   }
  160 |   await page
  161 |     .getByRole("navigation", { name: "Workspace", exact: true })
  162 |     .getByRole("button", { name: "Models", exact: true })
  163 |     .click();
  164 |   await expect(page).toHaveURL(/#models$/);
  165 |   await expect(page.locator(".workspace-native")).toHaveCount(0);
  166 | });
  167 | 
```