// Actual packaged desktop, disposable profile, localhost fixture model. No paid inference or Studio actions.
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { _electron, expect } from "@playwright/test";
import { fakeTransport, profile } from "../tests/generation-fixtures";

const executablePath = path.resolve(process.argv[2]);
const output = path.resolve(
  process.argv[3] ?? "docs/results/coordinator-workers/native1",
);
fs.mkdirSync(output, { recursive: true });
const calls: { phase: string; step?: string; taskId?: string }[] = [];
const transport = fakeTransport({
  inspect: (phase, context) =>
    calls.push({
      phase,
      step: context.coordination?.step,
      taskId: context.task?.id,
    }),
});
const modelServer = http.createServer(async (request, response) => {
  try {
    let body = "";
    for await (const chunk of request) body += chunk.toString();
    const result = await transport("http://127.0.0.1/fixture", {
      method: "POST",
      body,
    });
    response.writeHead(result.status, { "Content-Type": "application/json" });
    response.end(await result.text());
  } catch (error) {
    response.writeHead(500);
    response.end(JSON.stringify({ error: (error as Error).message }));
  }
});
modelServer.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => modelServer.once("listening", resolve));
const modelPort = (modelServer.address() as { port: number }).port;
const report: Record<string, unknown> = {
  at: new Date().toISOString(),
  executablePath,
  paidCalls: 0,
  actualCostMicros: 0,
  fixtureInference: true,
  nativeStudioTest: false,
};
const app = await _electron.launch({
  executablePath,
  args: [
    "--user-data-dir=" +
      path.resolve(".forge/coordinator-desktop", path.basename(output)),
  ],
  timeout: 30000,
});
try {
  const page = await app.firstWindow();
  await page.waitForURL("http://127.0.0.1:*/");
  const origin = new URL(page.url()).origin;
  report.origin = origin;
  report.identity = await app.evaluate(({ app }) => ({
    packaged: app.isPackaged,
    executable: app.getPath("exe"),
    profile: app.getPath("userData"),
  }));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const model = {
    ...profile(),
    name: "Offline coordinator verification",
    baseUrl: `http://127.0.0.1:${modelPort}/v1`,
    maxOutputTokens: 8192,
  };
  const settings = await page.request.put(origin + "/api/models", {
    data: {
      profiles: [model],
      routes: {
        planner: [model.id],
        builder: [model.id],
        reviewer: [model.id],
        repair: [model.id],
      },
      budgetMicros: 2_000_000,
      repairLimit: 1,
    },
  });
  assert.equal(settings.ok(), true, await settings.text());
  const created = await page.request.post(origin + "/api/projects", {
    data: {
      request: "Build a farming game with a repeatable harvest interaction",
    },
  });
  let project = await created.json();
  assert.equal(project.executionMode, "coordinator");
  const endpoint = origin + "/api/projects/" + project.id;
  async function run(action: "plan" | "build") {
    const response = await page.request.post(endpoint + "/" + action, {
      data: { revision: project.revision },
    });
    assert.equal(response.status(), 202, await response.text());
    await expect
      .poll(
        async () => {
          project = await (await page.request.get(endpoint)).json();
          return project.jobId;
        },
        { timeout: 30000 },
      )
      .toBeNull();
  }
  await run("plan");
  assert.equal(project.stage, "review", project.error);
  assert.equal(Object.keys(project.coordination.areas).length, 1);
  assert.equal(
    (
      await page.request.post(endpoint + "/approve", {
        data: { revision: project.revision },
      })
    ).ok(),
    true,
  );
  await run("build");
  assert.equal(project.stage, "ready_to_test", project.error);
  assert.equal(project.completedBuildTasks.length, 1);
  assert.equal(
    project.checks.filter((check: any) => check.status === "failed").length,
    0,
  );
  assert.equal(
    project.checks.find((check: any) => check.id === "studio").status,
    "pending",
  );
  assert.deepEqual(
    project.coordination.decisionHistory.map(
      (decision: any) => decision.action.action,
    ),
    ["delegate", "review", "finish"],
  );
  assert.equal(
    project.coordination.workers.every(
      (worker: any) => worker.status === "completed",
    ),
    true,
  );
  const exported = await page.request.get(endpoint + "/export");
  assert.equal(exported.ok(), true);
  assert.match(await exported.text(), /Harvest/);
  // UI-only connection fixture lets this offline artifact's activity be inspected.
  await page.route("**/api/status", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: { ...(await response.json()), studioConnectionGate: false },
    });
  });
  await page.goto(origin + "/?project=" + project.id);
  await page
    .getByText("Coordinator activity", { exact: false })
    .first()
    .click();
  await expect(
    page.getByText("4 completed assignments", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: path.join(output, "coordinator-ready.png") });
  assert.deepEqual(errors, []);
  Object.assign(report, {
    ok: true,
    calls,
    finalStage: project.stage,
    checks: project.checks,
    workerCount: project.coordination.workers.length,
    fixtureCharges: project.charges,
    rendererErrors: errors,
    exported: true,
  });
} catch (error) {
  report.error = (error as Error).stack;
  throw error;
} finally {
  await app.close();
  await new Promise<void>((resolve) => modelServer.close(() => resolve()));
  report.closed = true;
  fs.writeFileSync(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2),
  );
}
