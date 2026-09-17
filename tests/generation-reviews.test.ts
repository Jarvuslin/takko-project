import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mergeReview, validateReview } from "../src/generation/reviews";
import type { Review } from "../src/generation/schema";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { Configuration } from "../src/generation/settings";
import {
  fakeTransport,
  fixtureReview,
  profile,
  specification,
} from "./generation-fixtures";

const spec = specification("Build a farming game", "Scope");
const scenario = (
  id: string,
  requirementId = "core",
): Review["tests"][number] => ({
  ...fixtureReview.tests[0],
  id,
  requirementId,
});
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

it("rejects duplicate IDs even when they claim separate required behaviors", () => {
  const twoRequirements = structuredClone(spec);
  twoRequirements.requirements.push({
    ...twoRequirements.requirements[0],
    id: "respawn",
  });
  expect(() =>
    validateReview(
      {
        issues: [],
        tests: [scenario("shared"), scenario("shared", "respawn")],
      },
      twoRequirements,
    ),
  ).toThrow("duplicate test id: shared");
});

it("validates incoming test and issue references even when a protected test would win the merge", () => {
  expect(() =>
    validateReview(
      {
        issues: [
          {
            requirementId: "inventedIssue",
            severity: "error",
            message: "Missing behavior",
          },
        ],
        tests: [{ ...fixtureReview.tests[0], requirementId: "inventedTest" }],
      },
      spec,
      fixtureReview,
    ),
  ).toThrow(
    /test coreTest references unknown requirementId: inventedTest[\s\S]*issue references unknown requirementId: inventedIssue/,
  );
});

it("retains a new client lifecycle scenario alongside protected coverage for the same requirement", () => {
  const existing = structuredClone(fixtureReview);
  const regression = { ...scenario("afterRespawn"), mode: "client" as const };
  const next: Review = {
    issues: [],
    tests: [
      { ...existing.tests[0], mode: "client", source: "return function() end" },
      regression,
    ],
  };
  validateReview(next, spec, existing);
  const merged = mergeReview(existing, next);
  expect(merged.tests).toEqual([fixtureReview.tests[0], regression]);
  expect(existing).toEqual(fixtureReview);
  expect(mergeReview(merged, next).tests).toEqual(merged.tests);
});

it("allows a fresh review to replace stale issues while preserving protected tests", () => {
  const existing: Review = {
    tests: fixtureReview.tests,
    issues: [
      {
        requirementId: "oldUnknown",
        severity: "error",
        message: "Old review issue",
      },
    ],
  };
  expect(() => validateReview(fixtureReview, spec, existing)).not.toThrow();
  expect(mergeReview(existing, fixtureReview).issues).toEqual([]);
});

it("rejects effective capacity overflow without silently dropping a regression scenario", () => {
  const full: Review = {
    issues: [],
    tests: Array.from({ length: 40 }, (_, index) => scenario("case" + index)),
  };
  expect(
    mergeReview(full, { issues: [], tests: [scenario("case0")] }).tests,
  ).toEqual(full.tests);
  expect(() =>
    validateReview({ issues: [], tests: [scenario("additional")] }, spec, full),
  ).toThrow("exceeds 40 tests (41)");
  expect(full.tests).toHaveLength(40);
});

it("corrects duplicate reviewer IDs before checkpointing protected acceptance tests", async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "forge-review-contract-"),
  );
  directories.push(directory);
  const config = new Configuration(path.join(directory, "configuration"));
  const model = profile();
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 2e6,
    repairLimit: 1,
  });
  const store = new GenerationStore(directory);
  const fixture = fakeTransport();
  let reviewerAttempts = 0;
  let projectId = "";
  const transport = (async (url, init) => {
    const input = JSON.parse(String(init?.body));
    const response = await (await fixture(url, init)).json();
    if (input.messages[0].content.includes("PHASE: reviewer")) {
      expect(store.get(projectId).review).toBeNull();
      const review = JSON.parse(response.choices[0].message.content) as Review;
      if (++reviewerAttempts === 1)
        review.tests.push({ ...review.tests[0], mode: "client" });
      else
        expect(input.messages[1].content).toContain(
          "duplicate test id: coreTest",
        );
      response.choices[0].message.content = JSON.stringify(review);
    }
    return Response.json(response);
  }) as typeof fetch;
  // This isolates the review contract from compilation, Studio and provider services.
  const engine = new Engine(store, config, transport, async () => []);
  let project = engine.create("Build a farming game");
  projectId = project.id;
  engine.start(project.id, project.revision, "plan");
  project = await engine.wait(project.id);
  expect(project.stage).toBe("review");
  engine.approve(project.id, project.revision);
  engine.start(project.id, project.revision, "build");
  project = await engine.wait(project.id);
  expect(project.stage).toBe("ready_to_test");
  expect(reviewerAttempts).toBe(2);
  expect(project.review?.tests).toEqual(fixtureReview.tests);
  expect(project.charges.filter((charge) => charge.phase === "repair")).toEqual(
    [],
  );
});
