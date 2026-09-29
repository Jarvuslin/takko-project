# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b-foundation.spec.ts >> B icon navigation retains project selection and real model settings
- Location: tests\browser\b-foundation.spec.ts:132:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByLabel('Projects', { exact: true }) resolved to 2 elements:
    1) <summary title="Projects" aria-label="Projects">…</summary> aka getByTitle('Projects')
    2) <nav aria-label="Projects">…</nav> aka getByRole('navigation', { name: 'Projects' })

Call log:
  - waiting for getByLabel('Projects', { exact: true })

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
    - group [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: Search projects
          - searchbox "Search projects" [ref=e30]
        - generic [ref=e31]:
          - text: Recent projects
          - generic [ref=e32]: "0"
        - navigation "Projects" [ref=e33]:
          - paragraph [ref=e34]: Your projects will appear here.
    - generic [ref=e35]:
      - link "Download plugin" [ref=e36] [cursor=pointer]:
        - /url: /api/studio/plugin
      - generic [ref=e42]: Local workspace
  - main [ref=e44]:
    - generic [ref=e45]:
      - generic [ref=e46]: Workspace/New project
      - generic [ref=e47]:
        - generic "Create or open a project to set up Studio" [ref=e48]: Studio not connected
        - button "Models" [ref=e50] [cursor=pointer]
    - generic [ref=e53]:
      - heading "What do you want to build?" [level=1] [ref=e55]
      - paragraph [ref=e56]: Your next Roblox game starts with an idea.
      - generic [ref=e57]:
        - generic [ref=e58]: Game idea
        - textbox "Game idea" [ref=e59]:
          - /placeholder: Describe your game. Start with the fun part.
        - group "Attached assets"
        - generic [ref=e60]:
          - button "Browse Marketplace assets" [ref=e61] [cursor=pointer]:
            - generic [ref=e64]: Marketplace
          - button "Presets" [ref=e65] [cursor=pointer]
          - button "Budget for this generation" [ref=e68] [cursor=pointer]: Budget
          - button "Create project" [disabled] [ref=e69]
      - generic "Starting points" [ref=e73]:
        - button "Build an obby" [disabled] [ref=e74]
        - button "Make an arena" [disabled] [ref=e77]
        - button "Create a cozy world" [disabled] [ref=e80]
      - paragraph [ref=e83]: Plan it. Build it. Then test it in Studio.
```

# Test source

```ts
  42  |         id: "hit",
  43  |         from: "combat",
  44  |         to: "energy",
  45  |         event: "Hit confirmed",
  46  |         effect: "Add ten energy",
  47  |         kind: "event",
  48  |       },
  49  |       {
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
> 142 |     await page.getByLabel("Projects", { exact: true }).click();
      |                                                        ^ Error: locator.click: Error: strict mode violation: getByLabel('Projects', { exact: true }) resolved to 2 elements:
  143 |     await page.getByRole("searchbox", { name: "Search projects" }).fill(p.name);
  144 |     await page
  145 |       .getByRole("navigation", { name: "Projects", exact: true })
  146 |       .getByRole("button", { name: p.name, exact: true })
  147 |       .click();
  148 |     await expect(page.locator(".project-library")).not.toHaveAttribute(
  149 |       "open",
  150 |       "",
  151 |     );
  152 |   } else {
  153 |     await expect(page.getByLabel("Project", { exact: true })).toBeVisible();
  154 |   }
  155 |   await page
  156 |     .getByRole("navigation", { name: "Workspace", exact: true })
  157 |     .getByRole("button", { name: "Models", exact: true })
  158 |     .click();
  159 |   await expect(page).toHaveURL(/#models$/);
  160 |   await expect(page.locator(".workspace-native")).toHaveCount(0);
  161 | });
  162 | 
```