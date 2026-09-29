import { test, expect } from "./workspace-fixture";
import { fixtureBundle } from "../generation-fixtures";

test("Studio shows unresolved delivery honestly and only cancels undispatched work", async ({
  page,
}) => {
  const p = await (
    await page.request.post("/api/projects", {
      data: { request: "A Studio recovery fixture" },
    })
  ).json();
  const fixture = {
    ...p,
    stage: "ready_to_test",
    approvedRevision: 1,
    artifact: fixtureBundle(p.request, p.scope),
  };
  const operation = {
    id: "operation-fixture",
    kind: "apply",
    state: "dispatched",
    ok: null,
    logs: [],
  };
  const studio = {
    id: "studio-fixture",
    name: "Recovery fixture",
    protocolVersion: 2,
    capabilities: ["apply", "test"],
    operation,
  };
  await page.route("**/api/projects/" + p.id, (r) =>
    r.fulfill({ json: fixture }),
  );
  await page.route("**/api/status", (r) =>
    r.fulfill({ json: { studios: [studio] } }),
  );
  await page.goto("/?project=" + p.id);
  await page.getByRole("button", { name: "Studio details", exact: true }).click();
  await expect(
    page.getByText("delivered to Studio; awaiting confirmation or result", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Apply to Studio", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Cancel queued operation" }),
  ).toHaveCount(0);
  operation.state = "unknown";
  await expect(
    page.getByText("outcome unknown; inspect Studio before continuing", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Run tests", exact: true }),
  ).toBeDisabled();
  operation.state = "queued";
  let cancelled = false;
  await page.route(
    "**/api/studio/studio-fixture/operations/operation-fixture/cancel",
    (r) => {
      cancelled = true;
      operation.state = "cancelled";
      return r.fulfill({ json: operation });
    },
  );
  await page.getByRole("button", { name: "Cancel queued operation" }).click();
  expect(cancelled).toBe(true);
  await expect(
    page.getByText("cancelled before execution", { exact: false }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Apply to Studio", exact: true }),
  ).toBeEnabled();
  studio.protocolVersion = 1;
  await expect(
    page.getByText(
      "Update the Takko plugin and reconnect to enable operations.",
    ),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Apply to Studio", exact: true }),
  ).toBeDisabled();
});
