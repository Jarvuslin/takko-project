import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { componentReviewFixture } from "./component-review.fixture";
import {
  componentPreservationContext,
  componentPreservationChainContext,
  componentPreservationModelContext,
} from "../src/generation/component-preservation";
import {
  expectedAdaptedInventory,
  type ComponentAdaptation,
} from "../src/generation/component-adaptation";
import { validateComponentReview } from "../src/generation/component-review";

const hash = (source: string) =>
  createHash("sha256").update(source).digest("hex");
function fixture() {
  const { evidence: before, decision } = componentReviewFixture();
  before.nodes.push(
    { index: 4, parentIndex: 1, name: "Config", className: "BoolValue" },
    { index: 5, parentIndex: 1, name: "Obsolete", className: "Folder" },
    { index: 6, parentIndex: 5, name: "OldSource", className: "Script" },
    { index: 7, parentIndex: 1, name: "Geometry", className: "Part" },
  );
  before.sourceBodies[0].bindings.push({
    index: 6,
    className: "Script",
    disabled: false,
    runContext: "Enum.RunContext.Legacy",
  });
  before.configurationValues = [{ index: 4, property: "Value", value: true }];
  before.securityProfiles = [
    { indices: [2, 3, 6], sandboxed: true, capabilities: ["Basic"] },
  ];
  const plan: ComponentAdaptation = {
    packetHash: before.packetHash,
    inputHash: before.inputHash,
    reason: "Offline adaptation",
    removeSubtrees: [{ index: 5, reason: "Remove obsolete fixture subtree" }],
    replaceSources: [
      {
        indices: [2, 3],
        beforeSha256: before.sourceBodies[0].sha256,
        source: before.sourceBodies[0].source + "\n-- changed fixture",
        reason: "Grouped edit",
      },
    ],
    addSources: [
      {
        parentIndex: 4,
        securityTemplateIndex: 2,
        name: "Added",
        className: "ModuleScript",
        source: "return {}",
        reason: "Fixture integration module",
      },
    ],
    preservedBehavior: ["Claim requiring independent review"],
    remainingIntegration: [],
    nativeTestPlan: ["Not executed"],
    runtimeVerification: "not_performed",
  };
  const expected = expectedAdaptedInventory(
    {
      nodes: before.nodes,
      sources: before.sourceBodies.flatMap((body) =>
        body.bindings.map((binding) => ({
          ...binding,
          className: binding.className as "Script",
          source: body.source,
          sourceBytes: Buffer.byteLength(body.source),
        })),
      ),
      configurationValues: before.configurationValues,
    },
    plan,
  );
  const current = structuredClone(before);
  current.packetHash = "d".repeat(64);
  current.derivativeHash = "e".repeat(64);
  current.nodes = expected.nodes;
  current.configurationValues = expected.configurationValues;
  current.sourceBodies = [];
  for (const { source, sourceBytes: _bytes, ...binding } of expected.sources) {
    let body = current.sourceBodies.find(
      (item) => item.sha256 === hash(source),
    );
    if (!body) {
      body = { sha256: hash(source), source, bindings: [] };
      current.sourceBodies.push(body);
    }
    body.bindings.push(binding);
  }
  return { before, current, plan, decision };
}

it("derives removal/addition/grouped source maps from the same inventory algorithm as persistence", () => {
  const { before, current, plan } = fixture();
  const context = componentPreservationContext(before, current, plan);
  expect(context.before).toEqual(before);
  expect(context.appliedPlan).toEqual(plan);
  expect(context.mapping.indexMap).toEqual([
    { before: 1, after: 1 },
    { before: 2, after: 2 },
    { before: 3, after: 3 },
    { before: 4, after: 4 },
    { before: 7, after: 6 },
  ]);
  expect(context.mapping.removedBeforeIndices).toEqual([5, 6]);
  expect(context.mapping.addedSources).toEqual([
    { addition: 0, currentIndex: 5 },
  ]);
  expect(
    context.mapping.sourceBindings.map((row) => [
      row.beforeIndex,
      row.currentIndex,
      row.change,
    ]),
  ).toEqual([
    [2, 2, "replaced"],
    [3, 3, "replaced"],
    [6, null, "removed"],
    [null, 5, "added"],
  ]);
  const presented = componentPreservationModelContext(context);
  expect(presented.before.sourceBodies[0]).not.toHaveProperty("source");
  expect(presented.before.sourceBodies[0].numberedSource).toContain(
    "1: local sound",
  );
  expect(presented.appliedPlan.replaceSources[0]).not.toHaveProperty("source");
  expect(presented.appliedPlan.replaceSources[0].sourceSha256).toBe(
    current.sourceBodies[0].sha256,
  );
  expect(presented.appliedPlan.addSources?.[0].sourceSha256).toBe(
    hash("return {}"),
  );
  before.sourceBodies[0].source = "mutated caller";
  plan.preservedBehavior[0] = "mutated claim";
  expect(context.before.sourceBodies[0].source).not.toBe("mutated caller");
  expect(context.appliedPlan.preservedBehavior[0]).not.toBe("mutated claim");
});

it.each([
  "token",
  "candidateId",
  "inputHash",
  "originalHash",
  "samePacket",
  "sameArchive",
  "planIdentity",
  "source",
  "sourceHash",
  "binding",
  "node",
  "configuration",
])(
  "rejects foreign or mismatched %s before presenting preservation claims",
  (mode) => {
    const { before, current, plan } = fixture();
    if (["token", "candidateId", "inputHash", "originalHash"].includes(mode))
      (current as any)[mode] = "0".repeat(64);
    if (mode === "samePacket") current.packetHash = before.packetHash;
    if (mode === "sameArchive") current.derivativeHash = before.derivativeHash;
    if (mode === "planIdentity") plan.packetHash = "0".repeat(64);
    if (mode === "source") {
      current.sourceBodies[0].source += "\n-- undeclared";
      current.sourceBodies[0].sha256 = hash(current.sourceBodies[0].source);
    }
    if (mode === "sourceHash") current.sourceBodies[0].sha256 = "0".repeat(64);
    if (mode === "binding") current.sourceBodies[0].bindings[0].disabled = true;
    if (mode === "node") current.nodes[1].name = "Foreign";
    if (mode === "configuration") current.configurationValues![0].value = false;
    expect(() => componentPreservationContext(before, current, plan)).toThrow();
  },
);

it("does not let before-only source citations become current evidence", () => {
  const { before, current, plan, decision } = fixture();
  componentPreservationContext(before, current, plan);
  decision.packetHash = current.packetHash;
  expect(() => validateComponentReview(decision, current, ["style"])).toThrow(
    "every unique source body",
  );
  expect(decision.sources[0].sha256).toBe(before.sourceBodies[0].sha256);
});

it("preserves a flat original/parent/current comparison through grouped edits, removals and replaced additions", () => {
  const { before, current: parent, plan: firstPlan, decision } = fixture();
  const repair: ComponentAdaptation = {
    ...firstPlan,
    packetHash: parent.packetHash,
    removeSubtrees: [
      { index: 3, reason: "Remove one original binding" },
      { index: 4, reason: "Remove config and its previously added source" },
    ],
    replaceSources: [
      {
        index: 2,
        beforeSha256: parent.sourceBodies[0].sha256,
        source: parent.sourceBodies[0].source + "\n-- repair",
        reason: "Model-authored repair",
      },
    ],
    addSources: [
      {
        parentIndex: 1,
        securityTemplateIndex: 2,
        name: "ReplacementHelper",
        className: "ModuleScript",
        source: "return 2",
        reason: "Replacement helper",
      },
    ],
  };
  const expected = expectedAdaptedInventory(
    {
      nodes: parent.nodes,
      sources: parent.sourceBodies
        .flatMap((body) =>
          body.bindings.map((binding) => ({
            ...binding,
            className: binding.className as "Script",
            source: body.source,
            sourceBytes: Buffer.byteLength(body.source),
          })),
        )
        .sort((a, b) => a.index - b.index),
      configurationValues: parent.configurationValues,
    },
    repair,
  );
  const current = structuredClone(parent);
  current.packetHash = "8".repeat(64);
  current.derivativeHash = "9".repeat(64);
  current.nodes = expected.nodes;
  current.configurationValues = expected.configurationValues;
  current.sourceBodies = expected.sources.map(
    ({ source, sourceBytes: _bytes, ...binding }) => ({
      source,
      sha256: hash(source),
      bindings: [binding],
    }),
  );
  const raw = {
    before: structuredClone(before),
    parent: structuredClone(parent),
    current: structuredClone(current),
    firstPlan: structuredClone(firstPlan),
    repair: structuredClone(repair),
  };
  const context = componentPreservationChainContext(before, [
    { plan: firstPlan, evidence: parent },
    { plan: repair, evidence: current },
  ]);
  expect(context.original).toEqual(before);
  expect(context.before).toEqual(parent);
  expect(context.appliedPlan).toEqual(repair);
  expect(context.earlierSteps).toEqual([
    {
      parentPacketHash: before.packetHash,
      packetHash: parent.packetHash,
      appliedPlan: firstPlan,
      mapping: componentPreservationContext(before, parent, firstPlan).mapping,
    },
  ]);
  expect(context.originalMapping!.indexMap).toEqual([
    { before: 1, after: 1 },
    { before: 2, after: 2 },
    { before: 7, after: 3 },
  ]);
  expect(context.originalMapping!.removedOriginalIndices).toEqual([3, 4, 5, 6]);
  expect(
    context.originalMapping!.sourceBindings.map((row) => [
      row.beforeIndex,
      row.currentIndex,
      row.change,
    ]),
  ).toEqual([
    [2, 2, "replaced"],
    [3, null, "removed"],
    [6, null, "removed"],
    [null, 4, "added"],
  ]);
  expect(context.original).not.toHaveProperty("preservation");
  expect(context.earlierSteps![0]).not.toHaveProperty("before");
  expect({ before, parent, current, firstPlan, repair }).toEqual(raw);
  decision.packetHash = current.packetHash;
  expect(() => validateComponentReview(decision, current, ["style"])).toThrow(
    "every unique source body",
  );
  expect(() =>
    componentPreservationChainContext(before, [
      { plan: repair, evidence: current },
      { plan: firstPlan, evidence: parent },
    ]),
  ).toThrow();
  expect(() =>
    componentPreservationChainContext(before, [
      { plan: firstPlan, evidence: parent },
      { plan: { ...repair, packetHash: before.packetHash }, evidence: current },
    ]),
  ).toThrow();
  expect(() =>
    componentPreservationChainContext(before, [
      { plan: firstPlan, evidence: parent },
      { plan: repair, evidence: { ...current, token: "foreign" } },
    ]),
  ).toThrow();
  expect(() =>
    componentPreservationChainContext(before, [
      { plan: firstPlan, evidence: parent },
      { plan: repair, evidence: current },
      { plan: repair, evidence: current },
    ]),
  ).toThrow("one or two");
});
