import { expect, it, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  componentArchiveLuau,
  persistComponentArchive,
  type ComponentArchiveSnapshot,
} from "../src/generation/component-archive";
import {
  componentAdaptationLuau,
  expectedAdaptedInventory,
  persistComponentAdaptation,
  validateComponentAdaptation,
  type ComponentAdaptation,
  expandedSourceEdits,
  loadAdaptedComponentEvidence,
} from "../src/generation/component-adaptation";
import type { ComponentReviewEvidence } from "../src/generation/component-review";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const dirs: string[] = [];
function temp() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "takko-adapt-"));
  dirs.push(d);
  return d;
}
afterEach(() =>
  dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })),
);
function fixture() {
  const source = "return 1",
    bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
  const snapshot: Extract<ComponentArchiveSnapshot, { status: "captured" }> = {
    status: "captured",
    format: "roblox-native-rbxm-v1",
    engineVersion: "offline",
    base64: bytes.toString("base64"),
    bytes: bytes.length,
    executed: false,
    nodes: [
      { index: 1, parentIndex: 0, className: "Model", name: "Root" },
      { index: 2, parentIndex: 1, className: "ModuleScript", name: "Unused" },
      { index: 3, parentIndex: 2, className: "StringValue", name: "Setting" },
      { index: 4, parentIndex: 1, className: "Part", name: "Shape" },
      { index: 5, parentIndex: 4, className: "ModuleScript", name: "Keep" },
    ],
    sources: [2, 5].map((index) => ({
      index,
      className: "ModuleScript",
      source,
      sourceBytes: source.length,
    })),
    sourceBytes: source.length * 2,
    contentReferences: [],
    configurationValues: [{ index: 3, property: "Value", value: "x" }],
    roundTrip: {
      passed: true,
      checkedProperties: 0,
      checkedAttributes: 0,
      checkedReferences: 0,
      unobservableProperties: [],
      ignoredIdentityProperties: [],
    },
  };
  const evidence: ComponentReviewEvidence = {
    packetHash: "a".repeat(64),
    inputHash: "b".repeat(64),
    candidateId: "123",
    token: "fixture",
    originalHash: "c".repeat(64),
    derivativeHash: "d".repeat(64),
    nodes: snapshot.nodes,
    sourceBodies: [
      {
        sha256: hash(source),
        source,
        bindings: snapshot.sources.map(
          ({ source: _s, sourceBytes: _b, ...s }) => s,
        ),
      },
    ],
    removedCapabilities: [],
    boundary: "Offline fixture",
    configurationValues: snapshot.configurationValues,
    contentReferences: [],
  };
  const plan: ComponentAdaptation = {
    packetHash: evidence.packetHash,
    inputHash: evidence.inputHash,
    reason: "Remove unrelated source and adapt existing behavior",
    removeSubtrees: [{ index: 2, reason: "Unrelated helper" }],
    replaceSources: [
      {
        index: 5,
        beforeSha256: hash(source),
        source: "return 2",
        reason: "New behavior",
      },
    ],
    preservedBehavior: ["Shape retained"],
    remainingIntegration: ["Native testing"],
    nativeTestPlan: ["Inspect retained shape"],
    runtimeVerification: "not_performed",
  };
  return { snapshot, evidence, plan };
}
it.each([false, true])(
  "keeps original touch observations separate from adapted inventory (parent removed=%s)",
  (removeParent) => {
    const { snapshot, evidence, plan } = fixture();
    snapshot.runtimeOnlyInstances = [
      {
        parentIndex: 4,
        name: "TouchInterest",
        className: "TouchTransmitter",
        reconstruction: "touch_listener_required_unverified",
      },
    ];
    evidence.runtimeOnlyInstances = snapshot.runtimeOnlyInstances;
    if (removeParent) {
      plan.removeSubtrees = [{ index: 4, reason: "Remove fixture part" }];
      plan.replaceSources = [];
    }
    const directory = temp();
    const original = persistComponentArchive(snapshot, directory);
    if (original.status !== "captured") throw Error("fixture");
    evidence.derivativeHash = original.sha256;
    const {
      indexMap: _map,
      additionMap: _added,
      ...expected
    } = expectedAdaptedInventory(snapshot, plan);
    const after = { ...snapshot, ...expected, runtimeOnlyInstances: undefined };
    const record = persistComponentAdaptation(
      directory,
      {
        archiveHash: original.sha256,
        manifestHash: path.basename(original.manifestFile!, ".component.json"),
      },
      evidence,
      plan,
      after,
    );
    const loaded = loadAdaptedComponentEvidence(
      directory,
      record.sha256,
      evidence,
    );
    expect(loaded.runtimeOnlyInstances).toBeUndefined();
    expect(loaded.runtimeOnlyHistory).toEqual({
      archiveHash: original.sha256,
      instances: snapshot.runtimeOnlyInstances,
      survivingParents: removeParent
        ? []
        : [{ originalParentIndex: 4, currentParentIndex: 2 }],
    });
    expect(loaded.nodes).toEqual(after.nodes);
    expect(() =>
      persistComponentAdaptation(
        directory,
        {
          archiveHash: original.sha256,
          manifestHash: path.basename(
            original.manifestFile!,
            ".component.json",
          ),
        },
        evidence,
        plan,
        { ...after, runtimeOnlyInstances: snapshot.runtimeOnlyInstances },
      ),
    ).toThrow("introduced runtime-only");
  },
);
it("maps retained instance identities after worker removal and keeps only the specified source change", () => {
  const { snapshot, evidence, plan } = fixture();
  expect(validateComponentAdaptation(plan, evidence)).toEqual(plan);
  const result = expectedAdaptedInventory(snapshot, plan);
  expect(result.nodes.map((n) => [n.index, n.parentIndex, n.name])).toEqual([
    [1, 0, "Root"],
    [2, 1, "Shape"],
    [3, 2, "Keep"],
  ]);
  expect(result.sources.map((s) => [s.index, s.source])).toEqual([
    [3, "return 2"],
  ]);
  expect(result.configurationValues).toEqual([]);
});
it.each([
  "context",
  "root",
  "missing",
  "duplicate",
  "overlap",
  "deleted-edit",
  "wrong-hash",
  "no-op",
  "same-source",
  "duplicate-edit",
  "non-source",
  "all-content",
])("rejects invalid manifest: %s", (mode) => {
  const { evidence, plan } = fixture();
  if (mode === "context") plan.inputHash = "f".repeat(64);
  if (mode === "root") plan.removeSubtrees[0].index = 1;
  if (mode === "missing") plan.removeSubtrees[0].index = 999;
  if (mode === "duplicate") plan.removeSubtrees.push(plan.removeSubtrees[0]);
  if (mode === "overlap")
    plan.removeSubtrees.push({ index: 3, reason: "Already removed" });
  if (mode === "deleted-edit")
    plan.replaceSources[0] = { ...plan.replaceSources[0], index: 2 };
  if (mode === "wrong-hash")
    plan.replaceSources[0].beforeSha256 = "f".repeat(64);
  if (mode === "no-op") {
    plan.removeSubtrees = [];
    plan.replaceSources = [];
  }
  if (mode === "same-source") plan.replaceSources[0].source = "return 1";
  if (mode === "duplicate-edit")
    plan.replaceSources.push(plan.replaceSources[0]);
  if (mode === "non-source")
    plan.replaceSources[0] = { ...plan.replaceSources[0], index: 4 };
  if (mode === "all-content") {
    plan.removeSubtrees.push({ index: 4, reason: "Everything" });
    plan.replaceSources = [];
  }
  expect(() => validateComponentAdaptation(plan, evidence)).toThrow();
});
it.each([
  "valid",
  "media",
  "source",
  "hierarchy",
  "values",
  "roundtrip",
  "engine",
])(
  "persists only declared adapted inventory (%s), with original bytes retained",
  (mode) => {
    const { snapshot, evidence, plan } = fixture(),
      directory = temp();
    const original = persistComponentArchive(snapshot, directory);
    if (original.status !== "captured") throw Error("fixture");
    evidence.derivativeHash = original.sha256;
    const before = {
      archiveHash: original.sha256,
      manifestHash: path.basename(original.manifestFile!, ".component.json"),
    };
    const oldBytes = fs.readFileSync(original.archiveFile!);
    const {
      indexMap: _map,
      additionMap: _added,
      ...expected
    } = expectedAdaptedInventory(snapshot, plan);
    const after = { ...snapshot, ...expected };
    if (mode === "media")
      after.contentReferences = [
        { index: 2, property: "SoundId", value: "invented" },
      ];
    if (mode === "source") after.sources[0].source = "return 99";
    if (mode === "hierarchy") after.nodes[1].name = "Changed";
    if (mode === "values")
      after.configurationValues = [
        { index: 2, property: "Value", value: "invented" },
      ];
    if (mode === "roundtrip")
      after.roundTrip = { passed: false, stage: "compare", reason: "changed" };
    if (mode === "engine") after.engineVersion = "changed";
    if (mode === "valid") {
      const result = persistComponentAdaptation(
        directory,
        before,
        evidence,
        plan,
        after,
      );
      expect(result.sourceReview).toBe("required");
      const afterEvidence = loadAdaptedComponentEvidence(
        directory,
        result.sha256,
        evidence,
      );
      expect(afterEvidence.nodes).toEqual(after.nodes);
      expect(afterEvidence.sourceBodies).toEqual([
        {
          sha256: hash("return 2"),
          source: "return 2",
          bindings: [{ index: 3, className: "ModuleScript" }],
        },
      ]);
      expect(afterEvidence.packetHash).toBe(result.sha256);
      expect(afterEvidence.configurationValues).toEqual([]);
      fs.appendFileSync(result.file, " ");
      expect(() =>
        loadAdaptedComponentEvidence(directory, result.sha256, evidence),
      ).toThrow("identity mismatch");
      expect(result.executed).toBe(false);
      expect(result.indexMap).toEqual([
        { before: 1, after: 1 },
        { before: 4, after: 2 },
        { before: 5, after: 3 },
      ]);
    } else
      expect(() =>
        persistComponentAdaptation(directory, before, evidence, plan, after),
      ).toThrow();
    expect(fs.readFileSync(original.archiveFile!).equals(oldBytes)).toBe(true);
  },
);
it("compiles the actual native capture/adaptation functions", () => {
  const file = path.join(temp(), "adapt.luau");
  fs.writeFileSync(file, componentArchiveLuau + componentAdaptationLuau);
  execFileSync(
    path.resolve(
      process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
      "luau-compile" + (process.platform === "win32" ? ".exe" : ""),
    ),
    ["--null", file],
    { windowsHide: true },
  );
});
it("adds a client script with checked context, remaps later siblings and rebuilds security evidence", () => {
  const { snapshot, evidence, plan } = fixture();
  evidence.securityProfiles = [
    { indices: [2, 5], sandboxed: true, capabilities: ["Basic", "UI"] },
  ];
  plan.removeSubtrees = [];
  plan.replaceSources = [];
  plan.addSources = [
    {
      name: "ClientUI",
      parentIndex: 2,
      securityTemplateIndex: 5,
      className: "Script",
      runContext: "Client",
      disabled: false,
      source: "return 3",
      reason: "Client presentation",
    },
  ];
  expect(validateComponentAdaptation(plan, evidence)).toEqual(plan);
  const { indexMap, additionMap, ...expected } = expectedAdaptedInventory(
    snapshot,
    plan,
  );
  expect(indexMap.find((row) => row.before === 4)?.after).toBe(5);
  expect(additionMap).toEqual([{ addition: 0, index: 4 }]);
  expect(expected.sources.map((s) => [s.index, s.source])).toEqual([
    [2, "return 1"],
    [4, "return 3"],
    [6, "return 1"],
  ]);
  const directory = temp();
  const original = persistComponentArchive(snapshot, directory);
  if (original.status !== "captured") throw Error("fixture");
  evidence.derivativeHash = original.sha256;
  const result = persistComponentAdaptation(
    directory,
    {
      archiveHash: original.sha256,
      manifestHash: path.basename(original.manifestFile!, ".component.json"),
    },
    evidence,
    plan,
    { ...snapshot, ...expected },
  );
  expect(result.addedSources).toEqual([
    { addition: 0, index: 4, sandboxed: true, capabilities: ["Basic", "UI"] },
  ]);
  const after = loadAdaptedComponentEvidence(
    directory,
    result.sha256,
    evidence,
  );
  expect(after.securityProfiles).toEqual([
    { indices: [2, 6], sandboxed: true, capabilities: ["Basic", "UI"] },
    { indices: [4], sandboxed: true, capabilities: ["Basic", "UI"] },
  ]);
  expect(
    after.sourceBodies.find((body) => body.source === "return 3")?.bindings,
  ).toEqual([
    {
      index: 4,
      className: "Script",
      runContext: "Enum.RunContext.Client",
      disabled: false,
    },
  ]);
});
it.each([
  "missing-parent",
  "deleted-parent",
  "collision",
  "duplicate",
  "template",
  "profile",
  "settings",
  "local-context",
  "module-settings",
  "source-write",
])("rejects unsafe or ambiguous source addition: %s", (mode) => {
  const { evidence, plan } = fixture();
  evidence.securityProfiles = [
    { indices: [2, 5], sandboxed: true, capabilities: ["Basic"] },
  ];
  const add = {
    name: "ClientUI",
    parentIndex: 1,
    securityTemplateIndex: 5,
    className: "Script" as const,
    runContext: "Client" as const,
    disabled: false,
    source: "return 3",
    reason: "Client presentation",
  };
  plan.addSources = [add];
  if (mode === "missing-parent") add.parentIndex = 99;
  if (mode === "deleted-parent") add.parentIndex = 2;
  if (mode === "collision") add.name = "Shape";
  if (mode === "duplicate") plan.addSources.push(add);
  if (mode === "template") add.securityTemplateIndex = 4;
  if (mode === "profile") delete evidence.securityProfiles;
  if (mode === "settings") delete (add as any).runContext;
  if (mode === "local-context") (add as any).className = "LocalScript";
  if (mode === "module-settings") (add as any).className = "ModuleScript";
  if (mode === "source-write")
    add.source =
      'local child=Instance.new("LocalScript"); child.Source="print(1)"';
  expect(() => validateComponentAdaptation(plan, evidence)).toThrow();
});
it("expands an explicit repeated-source group without editing unlisted bindings", () => {
  const { evidence, plan } = fixture();
  plan.removeSubtrees = [];
  const { index: _index, ...edit } = expandedSourceEdits(plan)[0];
  plan.replaceSources = [{ ...edit, indices: [2, 5] }];
  expect(
    expandedSourceEdits(validateComponentAdaptation(plan, evidence)).map(
      (e) => e.index,
    ),
  ).toEqual([2, 5]);
  plan.replaceSources[0] = { ...edit, indices: [2, 2] };
  expect(() => validateComponentAdaptation(plan, evidence)).toThrow(
    "duplicate",
  );
});
it.each(["builtin", "invented", "retained"])(
  "checks worker media against retained Marketplace references (%s)",
  (mode) => {
    const { evidence, plan } = fixture();
    evidence.contentReferences = [
      { index: 4, property: "SoundId", value: "rbxassetid://123" },
    ];
    plan.replaceSources[0].source =
      mode === "builtin"
        ? 'return "rbxasset://sounds/electronicpingshort.wav"'
        : mode === "invented"
          ? 'return "rbxassetid://456"'
          : 'return "rbxassetid://123"';
    if (mode === "retained")
      expect(validateComponentAdaptation(plan, evidence)).toEqual(plan);
    else
      expect(() => validateComponentAdaptation(plan, evidence)).toThrow(
        /Marketplace|unretained/,
      );
  },
);
it("rechecks source hashes against the retained archive rather than caller-edited evidence", () => {
  const { snapshot, evidence, plan } = fixture(),
    directory = temp();
  const original = persistComponentArchive(snapshot, directory);
  if (original.status !== "captured") throw Error("fixture");
  evidence.derivativeHash = original.sha256;
  evidence.sourceBodies[0].source = "return 7";
  evidence.sourceBodies[0].sha256 = hash("return 7");
  plan.replaceSources[0].beforeSha256 = hash("return 7");
  expect(() =>
    persistComponentAdaptation(
      directory,
      {
        archiveHash: original.sha256,
        manifestHash: path.basename(original.manifestFile!, ".component.json"),
      },
      evidence,
      plan,
      snapshot,
    ),
  ).toThrow("retained input inventory");
});
