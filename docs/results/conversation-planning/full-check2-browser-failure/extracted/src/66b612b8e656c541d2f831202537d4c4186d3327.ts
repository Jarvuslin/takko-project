import type { Page } from "@playwright/test";

// Browser-only provider boundary. Backend authentication and persistence have separate API tests.
export async function mockProviderConnections(page: Page) {
  let connections: {
    provider: string;
    baseUrl: string;
    hasKey: boolean;
    validated: boolean;
  }[] = [];
  await page.route("**/api/models", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const response = await route.fetch();
    const current = await response.json();
    current.profiles = current.profiles.map((p: any) => ({
      ...p,
      hasKey:
        p.hasKey ||
        connections.some(
          (c) => c.provider === p.provider && c.baseUrl === p.baseUrl,
        ),
    }));
    await route.fulfill({
      json: {
        ...current,
        connections,
        credentialStorage: "windows-encrypted",
      },
    });
  });
  await page.route("**/api/provider-connections", async (route) => {
    const { profile, key } = route.request().postDataJSON();
    if (key === "rejected-fixture")
      return route.fulfill({
        status: 400,
        json: { error: "Provider rejected this key" },
      });
    connections = connections.filter(
      (c) => c.provider !== profile.provider || c.baseUrl !== profile.baseUrl,
    );
    if (route.request().method() !== "DELETE")
      connections.push({
        provider: profile.provider,
        baseUrl: profile.baseUrl,
        hasKey: true,
        validated: true,
      });
    const response = await page.request.get(
      new URL("/api/models", route.request().url()).href,
    );
    await route.fulfill({
      json: {
        ...(await response.json()),
        connections,
        credentialStorage: "windows-encrypted",
      },
    });
  });
  await page.route("**/api/model-profiles/*", async (route) => {
    if (route.request().method() !== "PUT") return route.continue();
    const { profile } = route.request().postDataJSON();
    if (
      !connections.some(
        (c) => c.provider === profile.provider && c.baseUrl === profile.baseUrl,
      )
    )
      return route.fulfill({
        status: 400,
        json: { error: "Validate provider first" },
      });
    const {
      connections: _connections,
      credentialStorage: _storage,
      ...current
    } = await (
      await page.request.get(new URL("/api/models", route.request().url()).href)
    ).json();
    current.profiles = current.profiles.map(
      ({ hasKey: _hasKey, ...p }: any) => p,
    );
    const result = await page.request.put(
      new URL("/api/models", route.request().url()).href,
      {
        data: {
          ...current,
          profiles: [
            ...current.profiles.filter(
              (p: { id: string }) => p.id !== profile.id,
            ),
            profile,
          ],
        },
      },
    );
    await route.fulfill({
      status: result.status(),
      json: {
        ...(await result.json()),
        connections,
        credentialStorage: "windows-encrypted",
      },
    });
  });
}
export async function connectFixture(page: Page, inDialog = false) {
  const scope = inDialog
    ? page.getByRole("dialog")
    : page.locator(".provider-browser");
  await scope
    .getByLabel("API key", { exact: true })
    .fill("browser-test-secret");
  await scope.getByRole("button", { name: "Validate & connect" }).click();
}
