# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace-animation.spec.ts >> dropped animation pack opens all entries, switches real WebGL clips and survives reload
- Location: tests\browser\marketplace-animation.spec.ts:4:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('combobox', { name: 'Animation from Combat pack' }).locator('option')
Expected: 3
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('combobox', { name: 'Animation from Combat pack' }).locator('option') with timeout 5000ms
  - waiting for getByRole('combobox', { name: 'Animation from Combat pack' }).locator('option')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Test source

```ts
  52  |         error: "Roblox denied access to this clip.",
  53  |       },
  54  |     ],
  55  |   };
  56  |   await page.route(`**/api/projects/${project.id}`, (route) =>
  57  |     route.fulfill({ json: project }),
  58  |   );
  59  |   await page.route("**/api/marketplace/inspect", (route) =>
  60  |     route.fulfill({
  61  |       json: {
  62  |         cacheHit: false,
  63  |         asset: {
  64  |           assetId: "123",
  65  |           name: "Combat pack",
  66  |           kind: "Model",
  67  |           creatorName: "Fixture",
  68  |           updated: "today",
  69  |           versionId: "456",
  70  |           liked: false,
  71  |           saved: false,
  72  |           inspection: {
  73  |             status: "no_issues_found",
  74  |             contentHash: "a".repeat(64),
  75  |             inspectedAt: new Date().toISOString(),
  76  |             scannerVersion: 1,
  77  |             scriptCount: 0,
  78  |             nodeCount: 3,
  79  |             findings: [],
  80  |           },
  81  |         },
  82  |       },
  83  |     }),
  84  |   );
  85  |   let imports = 0;
  86  |   await page.route(
  87  |     `**/api/projects/${project.id}/marketplace-animations`,
  88  |     async (route) => {
  89  |       expect(route.request().postDataJSON()).toEqual({
  90  |         revision: project.revision,
  91  |         studioId,
  92  |         reference: "123",
  93  |       });
  94  |       imports++;
  95  |       project = {
  96  |         ...project,
  97  |         animationPacks: [pack],
  98  |         conversation: [
  99  |           ...project.conversation,
  100 |           {
  101 |             id: randomUUID(),
  102 |             kind: "media",
  103 |             text: "Combat pack · 3 animations",
  104 |             animationPackId: pack.id,
  105 |             at: pack.at,
  106 |             revision: project.revision,
  107 |           },
  108 |         ],
  109 |       };
  110 |       await route.fulfill({ json: project });
  111 |     },
  112 |   );
  113 |   await page.goto(`/?project=${project.id}`);
  114 |   const transfer = await page.evaluateHandle(() => {
  115 |     const data = new DataTransfer();
  116 |     data.setData(
  117 |       "text/uri-list",
  118 |       "https://create.roblox.com/store/asset/123/Combat",
  119 |     );
  120 |     return data;
  121 |   });
  122 |   await page
  123 |     .locator(".chat-composer")
  124 |     .dispatchEvent("drop", { dataTransfer: transfer });
  125 |   const select = page.getByRole("combobox", {
  126 |     name: "Animation from Combat pack",
  127 |   });
  128 |   await expect(select).toHaveCount(1);
  129 |   await select.scrollIntoViewIfNeeded();
  130 |   await expect(select.locator("option")).toHaveCount(3);
  131 |   let viewer = page.getByRole("img", { name: "Punch on R6", exact: true });
  132 |   await page.locator(".animation-player").scrollIntoViewIfNeeded();
  133 |   await expect(viewer).toHaveAttribute("data-renderer", "webgl");
  134 |   await expect
  135 |     .poll(async () => Number(await viewer.getAttribute("data-triangles")))
  136 |     .toBeGreaterThan(50);
  137 |   await expect(page.getByText("Camera", { exact: true })).toHaveCount(0);
  138 |   await expect(
  139 |     page.getByRole("combobox", { name: "Playback speed" }),
  140 |   ).toHaveCount(0);
  141 |   await select.selectOption("1/2");
  142 |   await page.locator(".animation-player").scrollIntoViewIfNeeded();
  143 |   viewer = page.getByRole("img", { name: "Kick on R6", exact: true });
  144 |   await expect(viewer).toHaveAttribute("data-renderer", "webgl");
  145 |   await expect(page.locator(".animation-gallery canvas")).toHaveCount(1);
  146 |   await select.selectOption("1/3");
  147 |   await expect(
  148 |     page.getByText("Roblox denied access to this clip."),
  149 |   ).toBeVisible();
  150 |   await expect(page.locator(".animation-gallery canvas")).toHaveCount(0);
  151 |   await page.reload();
> 152 |   await expect(select.locator("option")).toHaveCount(3);
      |                                          ^ Error: expect(locator).toHaveCount(expected) failed
  153 |   expect(imports).toBe(1);
  154 | });
  155 | 
```