import { expect, test } from "./workspace-fixture";
import AxeBuilder from "@axe-core/playwright";

test("existing-project asset roles survive follow-up and reload without leaking into new chat", async ({
  page,
}) => {
  const created = await page.request.post("/api/projects", {
    data: { request: "Build a butter game" },
  });
  expect(created.ok()).toBe(true);
  let project = await created.json();
  project.assetAttachments = [
    {
      assetId: "123",
      name: "Working Butter",
      kind: "Model",
      creatorName: "Test Creator",
      contentHash: "a".repeat(64),
      revisionKey: "version:456",
      inspectedAt: new Date().toISOString(),
      scannerVersion: 1,
      scriptCount: 1,
      usage: "Keep its animation",
    },
  ];
  let planned = 0;
  await page.route("**/api/projects/" + project.id, async (route) => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON();
      expect(body.assetAttachments[0].assetId).toBe("123");
      project = {
        ...project,
        request: body.request,
        revision: project.revision + 1,
        assetAttachments: [
          {
            ...project.assetAttachments[0],
            usage: body.assetAttachments[0].usage,
          },
        ],
      };
    }
    await route.fulfill({ json: project });
  });
  await page.route(
    "**/api/projects/" + project.id + "/messages",
    async (route) => {
      const body = route.request().postDataJSON();
      expect(body.assetAttachments[0].assetId).toBe("123");
      project = {
        ...project,
        revision: project.revision + 1,
        assetAttachments: [
          {
            ...project.assetAttachments[0],
            usage: body.assetAttachments[0].usage,
          },
        ],
        conversation: [
          ...project.conversation,
          {
            id: body.id,
            kind: "user",
            revision: project.revision + 1,
            at: new Date().toISOString(),
            text: body.text,
          },
        ],
      };
      await route.fulfill({ json: project });
    },
  );
  await page.route("**/api/projects/" + project.id + "/plan", async (route) => {
    planned++;
    await route.fulfill({ json: project });
  });
  await page.goto("/?project=" + project.id);
  await expect(
    page.getByLabel("Use for Working Butter", { exact: true }),
  ).toHaveValue("Keep its animation");
  await page
    .getByLabel("Use for Working Butter", { exact: true })
    .fill("Keep the animation and sound");
  await page.getByLabel("Send message and update plan").click();
  await expect.poll(() => planned).toBe(1);
  await expect(page.getByLabel("Saved conversation")).toContainText(
    "Use the updated asset attachments",
  );
  await page.reload();
  await expect(
    page.getByLabel("Use for Working Butter", { exact: true }),
  ).toHaveValue("Keep the animation and sound");
  await page.getByRole("link", { name: "Takko home", exact: true }).click();
  await expect(page.getByLabel("Game idea")).toBeVisible();
  await expect(
    page.getByLabel("Use for Working Butter", { exact: true }),
  ).toHaveCount(0);
});

test("Marketplace supports saved assets, inspected drag/drop and chat attachment context", async ({
  page,
}, testInfo) => {
  const asset: any = {
    assetId: "123",
    name: "Working Butter",
    kind: "Model",
    creatorName: "Test Creator",
    updated: "2026-09-16",
    versionId: "456",
    liked: false,
    saved: false,
  };
  let inspections = 0,
    submitted: any;
  await page.route("**/api/marketplace/**", async (route) => {
    const url = new URL(route.request().url()),
      body =
        route.request().method() === "GET"
          ? {}
          : route.request().postDataJSON();
    let result: any = {};
    if (url.pathname.endsWith("/studios"))
      result = {
        studios: [
          { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
        ],
      };
    else if (url.pathname.endsWith("/search")) result = { assets: [asset] };
    else if (url.pathname.endsWith("/inspect")) {
      inspections++;
      asset.inspection = {
        scannerVersion: 1,
        contentHash: "a".repeat(64),
        inspectedAt: new Date().toISOString(),
        status: "no_issues_found",
        findings: [],
        scriptCount: 1,
        nodeCount: 2,
      };
      result = { asset, cacheHit: inspections > 1 };
    } else if (url.pathname.endsWith("/library/123")) {
      Object.assign(asset, body);
      result = asset;
    } else if (url.pathname.endsWith("/library"))
      result = {
        assets: [asset].filter(
          (a) =>
            url.searchParams.get("filter") === "all" ||
            a[url.searchParams.get("filter")!],
        ),
      };
    await route.fulfill({ json: result });
  });
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 400,
      json: {
        error: "Offline browser fixture: submitted attachment captured.",
      },
    });
  });
  await page.goto("/");
  await page.getByLabel("Game idea").fill("Make a satisfying butter game");
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  const panel = page.getByRole("complementary", { name: "Marketplace" });
  await expect(panel.getByLabel("Marketplace Studio")).toHaveValue(
    "392fce6b-fea7-4de3-bb2e-49a95231c3f5",
  );
  await panel.getByLabel("Search Marketplace", { exact: true }).fill("butter");
  await panel
    .getByRole("button", { name: "Search assets", exact: true })
    .click();
  const card = panel.getByRole("article");
  await expect(card.getByRole("link")).toHaveText("Working Butter");
  await panel.getByRole("button", { name: "Animations", exact: true }).click();
  await expect(panel.getByLabel("Asset type")).toHaveValue("Animation");
  await page.screenshot({
    path: `test-artifacts/asset-choices/marketplace-${testInfo.project.name}.png`,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await card.getByLabel("Like Working Butter", { exact: true }).click();
  await expect(
    card.getByLabel("Like Working Butter", { exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await card.getByLabel("Save Working Butter", { exact: true }).click();
  await panel.getByRole("button", { name: "Saved", exact: true }).click();
  await expect(card).toHaveCount(1);
  if (testInfo.project.name === "desktop") {
    await card.dragTo(page.getByLabel("Game idea"));
  } else await card.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page
      .getByRole("group", { name: "Attached assets", exact: true })
      .getByRole("status"),
  ).toContainText("Inspected and attached");
  await page.getByRole("button", { name: "Close Marketplace" }).click();
  await page
    .getByLabel("Use for Working Butter", { exact: true })
    .fill("Preserve its animation and sound");
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect
    .poll(() => submitted?.assetAttachments?.[0]?.usage)
    .toBe("Preserve its animation and sound");
  expect(submitted.assetAttachments[0].assetId).toBe("123");
  expect(submitted.assetAttachments[0].contentHash).toBe("a".repeat(64));
  await page.getByRole("button", { name: "Remove Working Butter" }).click();
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  await panel.getByRole("button", { name: "Saved", exact: true }).click();
  await card.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page
      .getByRole("group", { name: "Attached assets", exact: true })
      .getByRole("status"),
  ).toContainText("cached inspection");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("blocked first drops display findings and never become chat attachments", async ({
  page,
}) => {
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({
      json: {
        studios: [
          { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
        ],
      },
    }),
  );
  await page.route("**/api/marketplace/inspect", (r) =>
    r.fulfill({
      json: {
        cacheHit: false,
        asset: {
          assetId: "123",
          name: "Suspicious model",
          inspection: {
            status: "blocked",
            findings: [
              {
                rule: "dynamic-code",
                message: "Dynamic code execution or environment manipulation.",
              },
            ],
          },
        },
      },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Browse Marketplace assets", exact: true })
    .click();
  await expect(page.getByLabel("Marketplace Studio")).not.toHaveValue("");
  await page.getByRole("button", { name: "Close Marketplace" }).click();
  const data = await page.evaluateHandle(() => {
    const d = new DataTransfer();
    d.setData("text/uri-list", "https://create.roblox.com/store/asset/123");
    return d;
  });
  await page
    .getByLabel("Game idea")
    .dispatchEvent("drop", { dataTransfer: data });
  await expect(page.getByRole("status")).toContainText("was not attached");
  await expect(
    page.getByText("Dynamic code execution or environment manipulation."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove Suspicious model" }),
  ).toHaveCount(0);
});
