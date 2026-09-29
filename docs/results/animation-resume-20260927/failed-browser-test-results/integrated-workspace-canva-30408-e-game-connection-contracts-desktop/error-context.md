# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integrated-workspace.spec.ts >> canvas pan, zoom, dragging and auto layout preserve game connection contracts
- Location: tests\browser\integrated-workspace.spec.ts:82:1

# Error details

```
Error: page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:4319/?project=eb6c2764-0ae2-430f-bc7a-c512dccd5351
Call log:
  - navigating to "http://127.0.0.1:4319/?project=eb6c2764-0ae2-430f-bc7a-c512dccd5351", waiting until "load"

```

# Test source

```ts
  6   |   purpose: "A game system",
  7   |   authority: "server" as const,
  8   |   x: 30,
  9   |   y: 30,
  10  | });
  11  | test("canvas and conversation stay visible and remote changes never overwrite local edits", async ({
  12  |   page,
  13  | }, info) => {
  14  |   const p = await (
  15  |     await page.request.post("/api/projects", {
  16  |       data: { request: "A combat game" },
  17  |     })
  18  |   ).json();
  19  |   let graph: GameArchitecture = { nodes: [node("Combat")], edges: [] };
  20  |   await page.route("**/api/projects/" + p.id, (r) =>
  21  |     r.fulfill({ json: { ...p, architecture: graph } }),
  22  |   );
  23  |   await page.goto("/?project=" + p.id);
  24  |   const map = page.getByRole("region", { name: "Game architecture" }),
  25  |     chat = page.getByRole("region", { name: "Project conversation" });
  26  |   await expect(map).toBeVisible();
  27  |   await expect(chat).toBeVisible();
  28  |   await expect(
  29  |     page.getByRole("tablist", { name: "Project views" }),
  30  |   ).toHaveCount(0);
  31  |   const m = await map.boundingBox(),
  32  |     c = await chat.boundingBox();
  33  |   if (info.project.name === "desktop") {
  34  |     expect(m!.width).toBeGreaterThan(c!.width);
  35  |     expect(m!.x + m!.width).toBeLessThanOrEqual(c!.x + 1);
  36  |   } else {
  37  |     expect(m!.y + m!.height).toBeLessThanOrEqual(c!.y + 1);
  38  |   }
  39  |   graph = { nodes: [node("Combat"), { ...node("Energy"), x: 270 }], edges: [] };
  40  |   await expect(
  41  |     map.getByRole("button", { name: "Edit Energy", exact: true }),
  42  |   ).toBeVisible({ timeout: 7000 });
  43  |   await map.getByRole("button", { name: "Edit Combat", exact: true }).click();
  44  |   await map.getByLabel("System name", { exact: true }).fill("Local combat");
  45  |   await page.reload();
  46  |   await map
  47  |     .getByRole("button", { name: "Edit Local combat", exact: true })
  48  |     .click();
  49  |   await expect(map.getByLabel("System name", { exact: true })).toHaveValue(
  50  |     "Local combat",
  51  |   );
  52  |   expect(
  53  |     await page.locator(".map-surface").evaluate((el) => el.scrollTop),
  54  |   ).toBe(0);
  55  |   expect(await map.evaluate((el) => el.scrollTop)).toBe(0);
  56  |   graph = {
  57  |     ...graph,
  58  |     nodes: [...graph.nodes, { ...node("HUD"), x: 270, y: 180 }],
  59  |   };
  60  |   await expect(map.getByRole("alert")).toContainText(
  61  |     "A newer architecture arrived",
  62  |     { timeout: 7000 },
  63  |   );
  64  |   await expect(map.getByLabel("System name", { exact: true })).toHaveValue(
  65  |     "Local combat",
  66  |   );
  67  |   await map.getByRole("button", { name: "Close inspector" }).click();
  68  |   await page
  69  |     .getByLabel("Message", { exact: true })
  70  |     .fill("Make attacks feel faster");
  71  |   await map.getByRole("button", { name: "Load latest architecture" }).click();
  72  |   await expect(
  73  |     map.getByRole("button", { name: "Edit HUD", exact: true }),
  74  |   ).toBeVisible();
  75  |   await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
  76  |     "Make attacks feel faster",
  77  |   );
  78  |   await page.screenshot({
  79  |     path: `docs/results/integrated-workspace/workspace-${info.project.name}.png`,
  80  |   });
  81  | });
  82  | test("canvas pan, zoom, dragging and auto layout preserve game connection contracts", async ({
  83  |   page,
  84  | }, info) => {
  85  |   const p = await (
  86  |     await page.request.post("/api/projects", {
  87  |       data: { request: "A combat game" },
  88  |     })
  89  |   ).json();
  90  |   const architecture: GameArchitecture = {
  91  |     nodes: [node("Combat"), { ...node("Energy"), x: 260 }],
  92  |     edges: [
  93  |       {
  94  |         id: "hit",
  95  |         from: "Combat",
  96  |         to: "Energy",
  97  |         kind: "event",
  98  |         event: "Hit confirmed",
  99  |         effect: "Award energy",
  100 |       },
  101 |     ],
  102 |   };
  103 |   await page.request.post(`/api/projects/${p.id}/architecture`, {
  104 |     data: { id: crypto.randomUUID(), revision: p.revision, architecture },
  105 |   });
> 106 |   await page.goto("/?project=" + p.id);
      |              ^ Error: page.goto: net::ERR_NO_BUFFER_SPACE at http://127.0.0.1:4319/?project=eb6c2764-0ae2-430f-bc7a-c512dccd5351
  107 |   const map = page.getByRole("region", { name: "Game architecture" }),
  108 |     surface = page.locator(".map-surface"),
  109 |     content = page.locator(".architecture-canvas");
  110 |   const before = await content.getAttribute("style");
  111 |   await map.getByRole("button", { name: "Zoom in canvas" }).click();
  112 |   await expect(content).not.toHaveAttribute("style", before!);
  113 |   if (info.project.name === "desktop") {
  114 |     const box = (await surface.boundingBox())!;
  115 |     await page.mouse.move(box.x + 30, box.y + box.height - 80);
  116 |     await page.mouse.down();
  117 |     await page.mouse.move(box.x + 80, box.y + box.height - 60);
  118 |     await page.mouse.up();
  119 |     const system = map.getByRole("button", {
  120 |       name: "Edit Combat",
  121 |       exact: true,
  122 |     });
  123 |     const b = (await system.boundingBox())!;
  124 |     await page.mouse.move(b.x + 25, b.y + 20);
  125 |     await page.mouse.down();
  126 |     await page.mouse.move(b.x + 65, b.y + 60, { steps: 5 });
  127 |     await page.mouse.up();
  128 |     await map.getByRole("button", { name: "Close inspector" }).click();
  129 |     await expect(
  130 |       map.getByRole("button", { name: "Review changes" }),
  131 |     ).toBeVisible();
  132 |   }
  133 |   await map.getByRole("button", { name: "Auto layout" }).click();
  134 |   await map.getByRole("button", { name: "Review changes" }).click();
  135 |   await expect(map).toContainText("Only node positions changed");
  136 |   await map.getByRole("button", { name: "Save architecture" }).click();
  137 |   await expect(
  138 |     map.getByRole("button", { name: "Review changes" }),
  139 |   ).toBeHidden();
  140 |   const saved = await (await page.request.get("/api/projects/" + p.id)).json();
  141 |   expect(saved.architecture.edges).toEqual(architecture.edges);
  142 |   expect(saved.architecture.nodes[1].x).toBeGreaterThan(
  143 |     saved.architecture.nodes[0].x,
  144 |   );
  145 | });
  146 | 
  147 | test("R15 previews respect reduced motion and recover explicitly when graphics context is lost", async ({
  148 |   page,
  149 | }) => {
  150 |   const p = await (
  151 |     await page.request.post("/api/projects", {
  152 |       data: { request: "Animation accessibility test" },
  153 |     })
  154 |   ).json();
  155 |   const clip = {
  156 |     version: 1,
  157 |     name: "R15 wave",
  158 |     rig: "R15",
  159 |     duration: 1,
  160 |     tracks: [
  161 |       {
  162 |         joint: "RightUpperArm",
  163 |         keys: [
  164 |           { time: 0, rotation: [0, 0, 0] },
  165 |           { time: 0.5, rotation: [0, 0, 1.2] },
  166 |           { time: 1, rotation: [0, 0, 0] },
  167 |         ],
  168 |       },
  169 |     ],
  170 |   };
  171 |   const imported = await page.request.post(`/api/projects/${p.id}/animations`, {
  172 |     data: { id: crypto.randomUUID(), revision: p.revision, clip },
  173 |   });
  174 |   expect(imported.ok()).toBe(true);
  175 |   await page.emulateMedia({ reducedMotion: "reduce" });
  176 |   await page.goto("/?project=" + p.id);
  177 |   const viewer = page.getByRole("img", {
  178 |     name: "R15 wave on R15",
  179 |     exact: true,
  180 |   });
  181 |   await page.locator(".animation-player").scrollIntoViewIfNeeded();
  182 |   await viewer.scrollIntoViewIfNeeded();
  183 |   await expect(
  184 |     page.getByRole("button", { name: "Play animation", exact: true }),
  185 |   ).toBeVisible();
  186 |   await expect(viewer).toHaveAttribute("data-time", "0.000");
  187 |   await expect
  188 |     .poll(async () => Number(await viewer.getAttribute("data-triangles")))
  189 |     .toBe(180);
  190 |   await viewer.dispatchEvent("webglcontextlost");
  191 |   await expect(page.getByRole("alert")).toContainText(
  192 |     "lost its graphics context",
  193 |   );
  194 |   await page
  195 |     .getByRole("button", { name: "Retry preview", exact: true })
  196 |     .click();
  197 |   await viewer.scrollIntoViewIfNeeded();
  198 |   await expect
  199 |     .poll(async () => Number(await viewer.getAttribute("data-triangles")))
  200 |     .toBe(180);
  201 |   await expect(page.getByRole("alert")).toHaveCount(0);
  202 | });
  203 | 
```