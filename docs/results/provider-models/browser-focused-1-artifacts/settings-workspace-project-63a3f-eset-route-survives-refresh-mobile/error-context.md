# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings-workspace.spec.ts >> project-specific preset route survives refresh
- Location: tests\browser\settings-workspace.spec.ts:318:1

# Error details

```
Error: "route.fetch: Test ended.
Call log:
  - → GET http://127.0.0.1:4319/api/models
    - user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - accept-language: en-US
    - content-type: application/json
    - referer: http://127.0.0.1:4319/?project=9be02b36-6b5b-4138-ae35-266f24bcf52c
    - sec-ch-ua: "HeadlessChrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"
    - sec-ch-ua-mobile: ?1
    - sec-ch-ua-platform: "iOS"
" while running route callback.
Consider awaiting `await page.unrouteAll({ behavior: 'ignoreErrors' })`
before the end of the test to ignore remaining routes in flight.
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | 
  3  | // Browser-only provider boundary. Backend authentication and persistence have separate API tests.
  4  | export async function mockProviderConnections(page: Page) {
  5  |   let connections: {
  6  |     provider: string;
  7  |     baseUrl: string;
  8  |     hasKey: boolean;
  9  |     validated: boolean;
  10 |   }[] = [];
  11 |   await page.route("**/api/models", async (route) => {
  12 |     if (route.request().method() !== "GET") return route.continue();
> 13 |     const response = await route.fetch();
     |                                  ^ Error: "route.fetch: Test ended.
  14 |     await route.fulfill({
  15 |       json: {
  16 |         ...(await response.json()),
  17 |         connections,
  18 |         credentialStorage: "windows-encrypted",
  19 |       },
  20 |     });
  21 |   });
  22 |   await page.route("**/api/provider-connections", async (route) => {
  23 |     const { profile, key } = route.request().postDataJSON();
  24 |     if (key === "rejected-fixture")
  25 |       return route.fulfill({
  26 |         status: 400,
  27 |         json: { error: "Provider rejected this key" },
  28 |       });
  29 |     connections = connections.filter(
  30 |       (c) => c.provider !== profile.provider || c.baseUrl !== profile.baseUrl,
  31 |     );
  32 |     if (route.request().method() !== "DELETE")
  33 |       connections.push({
  34 |         provider: profile.provider,
  35 |         baseUrl: profile.baseUrl,
  36 |         hasKey: true,
  37 |         validated: true,
  38 |       });
  39 |     const response = await page.request.get("/api/models");
  40 |     await route.fulfill({
  41 |       json: {
  42 |         ...(await response.json()),
  43 |         connections,
  44 |         credentialStorage: "windows-encrypted",
  45 |       },
  46 |     });
  47 |   });
  48 |   await page.route("**/api/model-profiles/*", async (route) => {
  49 |     if (route.request().method() !== "PUT") return route.continue();
  50 |     const { profile } = route.request().postDataJSON();
  51 |     if (
  52 |       !connections.some(
  53 |         (c) => c.provider === profile.provider && c.baseUrl === profile.baseUrl,
  54 |       )
  55 |     )
  56 |       return route.fulfill({
  57 |         status: 400,
  58 |         json: { error: "Validate provider first" },
  59 |       });
  60 |     const { connections: _connections, credentialStorage: _storage, ...current } = await (await page.request.get("/api/models")).json();
  61 |     current.profiles = current.profiles.map(({ hasKey: _hasKey, ...p }: any) => p);
  62 |     const result = await page.request.put("/api/models", {
  63 |       data: {
  64 |         ...current,
  65 |         profiles: [
  66 |           ...current.profiles.filter(
  67 |             (p: { id: string }) => p.id !== profile.id,
  68 |           ),
  69 |           profile,
  70 |         ],
  71 |       },
  72 |     });
  73 |     await route.fulfill({ status: result.status(),
  74 |       json: {
  75 |         ...(await result.json()),
  76 |         connections,
  77 |         credentialStorage: "windows-encrypted",
  78 |       },
  79 |     });
  80 |   });
  81 | }
  82 | export async function connectFixture(page: Page, inDialog = false) {
  83 |   const scope = inDialog
  84 |     ? page.getByRole("dialog")
  85 |     : page.locator(".provider-browser");
  86 |   await scope
  87 |     .getByLabel("API key", { exact: true })
  88 |     .fill("browser-test-secret");
  89 |   await scope.getByRole("button", { name: "Validate & connect" }).click();
  90 | }
  91 | 
```