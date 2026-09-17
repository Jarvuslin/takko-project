import { expect, it } from "vitest";
import { componentStageContext } from "../src/generation/asset-pipeline";
import type {
  AssetCandidate,
  AssetNeed,
  AssetPipelineRun,
} from "../src/generation/asset-contract";

const candidate: AssetCandidate = {
  id: "101",
  name: "Fixture component",
  kind: "Model",
  creator: "offline",
  sourceUrl: "https://example.test/101",
  price: 0,
  source: "creator_store",
};
const need = (id: string): AssetNeed => ({
  id,
  kind: "Model",
  role: "Reusable fixture",
  requirementId: "core",
  query: "component",
  constraints: "Preserve requested behavior",
  required: true,
  position: [0, 0, 0],
  maxSize: 10,
});
function fixture() {
  const needs = ["current", "next", "unknown", "failed", "earlier"].map(need);
  const run: AssetPipelineRun = {
    version: 1,
    runId: "fixture",
    revision: 1,
    inputHash: "f".repeat(64),
    status: "running",
    startedAt: "2026-09-16T00:00:00Z",
    adapter: "offline",
    policy: {
      maxSearches: 3,
      maxCandidates: 3,
      allowEscalation: false,
      workerRoute: "worker",
      evaluatorRoute: "reviewer",
    },
    needs: needs.slice(0, 4),
    inputContext: {
      revision: 1,
      request: "Fixture",
      needs,
      scope: "Forge_fixture",
      integrationTasks: [
        {
          id: "component",
          title: "Prepare component",
          requirements: ["core"],
          dependsOn: [],
          files: [],
        },
        {
          id: "integrate",
          title: "Bind components",
          requirements: ["core"],
          dependsOn: ["component"],
          files: ["ServerScriptService/Forge_fixture/Integration.server.luau"],
        },
      ],
    },
    entries: [
      { needId: "current", status: "pending", attempts: 1 },
      { needId: "next", status: "pending", attempts: 0 },
      {
        needId: "failed",
        status: "failed",
        attempts: 2,
        reason: "Native rejection",
      },
    ],
    events: [],
  };
  const retained: AssetPipelineRun["entries"] = [
    {
      needId: "earlier",
      status: "passed",
      attempts: 1,
      selected: candidate,
      componentContextHash: run.inputHash,
      component: {
        needId: "earlier",
        candidateId: candidate.id,
        recordHash: "1".repeat(64),
        inputHash: "e".repeat(64),
        packetHash: "2".repeat(64),
        archiveHash: "3".repeat(64),
        conversionHash: "4".repeat(64),
        destinationPath: "Workspace/Forge_fixture/Assets/earlier",
        rootName: "Model",
        runtimeVerification: "not_performed",
        placement: "worker_integration_required",
      },
    },
  ];
  return { run, retained, current: needs[0] };
}

it("distinguishes current, unstarted, unknown, failed and historical retained needs without promoting runtime coverage", () => {
  const { run, retained, current } = fixture();
  const context = componentStageContext(run, current, candidate, retained);
  expect(context.namespace).toBe("Forge_fixture");
  expect(context.allowedRoots).toHaveLength(6);
  expect(context.allowedRoots).toContain(
    "StarterPlayer/StarterPlayerScripts/Forge_fixture",
  );
  expect(context.needs.map((entry) => entry.progress)).toEqual([
    "current_component",
    "unstarted_unverified",
    "unknown_unverified",
    "not_retained_unverified",
    "retained_full_game_unverified",
  ]);
  expect(context.needs[2].status).toBe("unknown");
  expect(context.needs[3]).toMatchObject({
    status: "failed",
    reason: "Native rejection",
  });
  expect(context.needs[4]).toMatchObject({
    status: "passed",
    retainedFromEarlierRun: true,
    retainedComponent: {
      runtimeVerification: "not_performed",
      rootPath: "Workspace/Forge_fixture/Assets/earlier/Model",
    },
  });
  expect(context.integrationTasks.tasks).toEqual(
    run.inputContext!.integrationTasks,
  );
  expect(context.integrationTasks.status).toBe(
    "accepted_plan_not_execution_evidence",
  );
});

it("returns isolated chronological snapshots and explicitly unknown legacy namespace/task ownership", () => {
  const { run, retained, current } = fixture();
  const before = componentStageContext(run, current, candidate, retained);
  run.events.push({
    at: "later",
    needId: current.id,
    step: "component_review_result",
    data: {},
  });
  run.entries[1].attempts = 1;
  const after = componentStageContext(run, current, candidate, retained);
  expect([before.eventSequence, after.eventSequence]).toEqual([0, 1]);
  expect(before.needs[1].progress).toBe("unstarted_unverified");
  expect(after.needs[1].progress).toBe("not_retained_unverified");
  before.needs[0].need.required = false;
  before.current.candidate.name = "Mutated callback";
  before.integrationTasks.tasks[1].files.length = 0;
  expect(current.required).toBe(true);
  expect(candidate.name).toBe("Fixture component");
  expect(run.inputContext!.integrationTasks![1].files).toHaveLength(1);
  delete run.inputContext!.scope;
  delete run.inputContext!.integrationTasks;
  const legacy = componentStageContext(run, current, candidate, retained);
  expect(legacy.namespaceStatus).toBe("unavailable_do_not_guess");
  expect(legacy.allowedRoots).toEqual([]);
  expect(legacy.integrationTasks.status).toBe("unavailable_do_not_guess");
});

it.each([
  "need",
  "candidate",
  "retained-input",
  "retained-candidate",
  "retained-status",
  "retained-destination",
  "duplicate-entry",
])("rejects mismatched stage identity (%s)", (mode) => {
  const { run, retained, current } = fixture();
  const selected = structuredClone(candidate);
  if (mode === "need") current.role = "Different need";
  // Separate declared context from the current need object for this forgery.
  if (mode === "need")
    run.inputContext!.needs = [
      need("current"),
      ...run.inputContext!.needs.slice(1),
    ];
  if (mode === "candidate")
    run.entries[0].selected = { ...candidate, id: "202" };
  if (mode === "retained-input")
    retained[0].componentContextHash = "0".repeat(64);
  if (mode === "retained-candidate") retained[0].component!.candidateId = "202";
  if (mode === "retained-status") retained[0].status = "pending";
  if (mode === "retained-destination")
    retained[0].component!.destinationPath = "Workspace/Foreign/Assets/earlier";
  if (mode === "duplicate-entry")
    run.entries.push(structuredClone(run.entries[0]));
  expect(() => componentStageContext(run, current, selected, retained)).toThrow(
    /Component stage/,
  );
});
