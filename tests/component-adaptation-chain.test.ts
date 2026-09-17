import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import { integrationFixture } from "./component-integration.fixture";
import { readComponentOriginal } from "../src/generation/component-derivative";
import {
  componentEvidence,
  persistComponentIntegration,
  loadComponentIntegration,
} from "../src/generation/component-integration";
import { xml } from "../src/generation/export";
import {
  expectedAdaptedInventory,
  loadAdaptedComponentEvidence,
  loadComponentAdaptationChain,
  persistComponentAdaptation,
  type ComponentAdaptation,
} from "../src/generation/component-adaptation";

const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const directories: string[] = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);
function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-chain-"));
  directories.push(directory);
  const original = integrationFixture(directory, "Forge_fixture", {
    runtimeTouch: true,
    media: [
      { className: "Sound", property: "SoundId", value: "rbxassetid://24680" },
    ],
  });
  const preparedHash = original.evidence.packetHash;
  const root = loadComponentAdaptationChain(
    directory,
    preparedHash,
    preparedHash,
    original.evidence.inputHash,
  );
  function apply(
    parent: typeof root,
    ordinal: number,
    customize?: (plan: ComponentAdaptation) => void,
  ) {
    const source = parent.evidence.sourceBodies[0];
    const plan: ComponentAdaptation = {
      packetHash: parent.evidence.packetHash,
      inputHash: parent.evidence.inputHash,
      reason: "Synthetic worker edit",
      removeSubtrees: [],
      replaceSources: [
        {
          indices: source.bindings.map((binding) => binding.index),
          beforeSha256: source.sha256,
          source: source.source + `\n-- edit ${ordinal}`,
          reason: "Synthetic repair",
        },
      ],
      preservedBehavior: ["Subject to source review"],
      remainingIntegration: ["Native verification remains pending"],
      nativeTestPlan: ["Observe runtime"],
      runtimeVerification: "not_performed",
    };
    customize?.(plan);
    const before = readComponentOriginal(
      directory,
      parent.archive.archiveHash,
      parent.archive.manifestHash,
    ).snapshot;
    const {
      indexMap: _map,
      additionMap: _added,
      ...inventory
    } = expectedAdaptedInventory(before, plan);
    const bytes = Buffer.concat([
      Buffer.from(before.base64, "base64"),
      Buffer.from(`-edit${ordinal}`),
    ]);
    const snapshot = {
      ...before,
      ...inventory,
      runtimeOnlyInstances: undefined,
      base64: bytes.toString("base64"),
      bytes: bytes.length,
    };
    const record = persistComponentAdaptation(
      directory,
      parent.archive,
      parent.evidence,
      plan,
      snapshot,
    );
    const evidence = loadAdaptedComponentEvidence(
      directory,
      record.sha256,
      parent.evidence,
    );
    return {
      record,
      plan,
      evidence,
      state: {
        ...parent,
        evidence,
        archive: record.adapted,
        steps: [
          ...parent.steps,
          {
            parentPacketHash: parent.evidence.packetHash,
            packetHash: record.sha256,
            plan,
            indexMap: record.indexMap,
          },
        ],
      },
    };
  }
  return { directory, original, preparedHash, root, apply };
}

it("loads zero, legacy single and two-hop chains from the exact prepared root without rewriting records", () => {
  const f = fixture();
  const first = f.apply(f.root, 1);
  const firstBytes = fs.readFileSync(first.record.file, "utf8");
  const second = f.apply(first.state, 2);
  const secondBytes = fs.readFileSync(second.record.file, "utf8");
  const loaded = loadComponentAdaptationChain(
    f.directory,
    f.preparedHash,
    second.record.sha256,
    f.root.evidence.inputHash,
  );
  expect(loaded.evidence).toEqual(second.evidence);
  expect(loaded.preparedEvidence).toEqual(f.root.evidence);
  expect(
    loaded.steps.map((step) => [step.parentPacketHash, step.packetHash]),
  ).toEqual([
    [f.preparedHash, first.record.sha256],
    [first.record.sha256, second.record.sha256],
  ]);
  expect(loaded.archive).toEqual(second.record.adapted);
  expect(
    componentEvidence(
      f.directory,
      f.preparedHash,
      second.record.sha256,
      f.root.evidence.inputHash,
    ),
  ).toEqual(second.evidence);
  expect(
    loadComponentAdaptationChain(
      f.directory,
      f.preparedHash,
      first.record.sha256,
      f.root.evidence.inputHash,
    ).evidence,
  ).toEqual(first.evidence);
  expect(f.root.steps).toEqual([]);
  expect(fs.readFileSync(first.record.file, "utf8")).toBe(firstBytes);
  expect(fs.readFileSync(second.record.file, "utf8")).toBe(secondBytes);
  expect(JSON.parse(firstBytes).version).toBe(1);
  expect(JSON.parse(secondBytes).version).toBe(1);
});

it.each([false, true])(
  "composes original touch-parent history through both remaps (parent removed=%s)",
  (removeParent) => {
    const f = fixture();
    const first = f.apply(f.root, 1, (plan) => {
      plan.removeSubtrees = [
        { index: 2, reason: "Remove repeated fixture source" },
      ];
      plan.replaceSources = [
        {
          index: 3,
          beforeSha256: f.root.evidence.sourceBodies[0].sha256,
          source: "return {}",
          reason: "Fixture change",
        },
      ];
      plan.addSources = [
        {
          parentIndex: 1,
          name: "Added",
          className: "ModuleScript",
          source: "return 1",
          securityTemplateIndex: 3,
          reason: "Fixture addition",
        },
      ];
    });
    expect(first.evidence.runtimeOnlyHistory?.survivingParents).toEqual([
      { originalParentIndex: 4, currentParentIndex: 3 },
    ]);
    const second = f.apply(first.state, 2, (plan) => {
      plan.removeSubtrees = [
        { index: removeParent ? 3 : 2, reason: "Remove fixture subtree" },
      ];
      const added = first.evidence.sourceBodies.find(
        (body) => body.source === "return 1",
      )!;
      plan.replaceSources = [
        {
          index: added.bindings[0].index,
          beforeSha256: added.sha256,
          source: "return 2",
          reason: "Repair added source",
        },
      ];
    });
    const loaded = loadComponentAdaptationChain(
      f.directory,
      f.preparedHash,
      second.record.sha256,
      f.root.evidence.inputHash,
    );
    expect(loaded.evidence.runtimeOnlyHistory).toEqual({
      archiveHash: f.root.evidence.derivativeHash,
      instances: f.root.evidence.runtimeOnlyInstances,
      survivingParents: removeParent
        ? []
        : [{ originalParentIndex: 4, currentParentIndex: 2 }],
    });
    expect(loaded.evidence.runtimeOnlyInstances).toBeUndefined();
    expect(
      loaded.evidence
        .securityProfiles!.flatMap((profile) => profile.indices)
        .sort(),
    ).toEqual(
      loaded.evidence.sourceBodies
        .flatMap((body) => body.bindings.map((binding) => binding.index))
        .sort(),
    );
  },
);

it.each([
  "input",
  "parent-packet",
  "parent-archive",
  "parent-manifest",
  "index-map",
  "source-before",
  "foreign-root",
  "missing-parent",
  "cycle-link",
  "root-tamper",
])("rejects forged or stale chain identity (%s)", (mode) => {
  const f = fixture();
  const first = f.apply(f.root, 1),
    second = f.apply(first.state, 2);
  const raw = JSON.parse(fs.readFileSync(second.record.file, "utf8"));
  let head = second.record.sha256,
    prepared = f.preparedHash;
  if (mode === "input") raw.plan.inputHash = "0".repeat(64);
  if (mode === "parent-packet") raw.plan.packetHash = f.preparedHash;
  if (mode === "parent-archive")
    raw.original.archiveHash = f.root.archive.archiveHash;
  if (mode === "parent-manifest")
    raw.original.manifestHash = f.root.archive.manifestHash;
  if (mode === "index-map") raw.indexMap[0].after = 999;
  if (mode === "source-before")
    raw.plan.replaceSources[0].beforeSha256 = "0".repeat(64);
  if (mode === "foreign-root")
    prepared = integrationFixture(f.directory, "Forge_fixture", {
      token: "22345678-1234-4234-8234-123456789abc",
      candidateId: "202",
    }).evidence.packetHash;
  if (mode === "missing-parent") fs.unlinkSync(first.record.file);
  if (mode === "cycle-link") {
    // A self-link cannot retain its content hash: reject the altered record
    // before following it, rather than trusting an attacker-chosen filename.
    raw.plan.packetHash = second.record.sha256;
    fs.writeFileSync(second.record.file, JSON.stringify(raw));
  } else if (mode === "root-tamper")
    fs.appendFileSync(
      path.join(f.directory, f.preparedHash + ".review.json"),
      " ",
    );
  else if (!["foreign-root", "missing-parent"].includes(mode)) {
    const text = JSON.stringify(raw, null, 2) + "\n";
    head = hash(text);
    fs.writeFileSync(path.join(f.directory, head + ".adaptation.json"), text);
  }
  expect(() =>
    loadComponentAdaptationChain(
      f.directory,
      prepared,
      head,
      f.root.evidence.inputHash,
    ),
  ).toThrow();
});

it("rejects a fully persisted third adaptation instead of silently shortening its ancestry", () => {
  const f = fixture();
  const first = f.apply(f.root, 1),
    second = f.apply(first.state, 2),
    third = f.apply(second.state, 3);
  expect(() =>
    loadComponentAdaptationChain(
      f.directory,
      f.preparedHash,
      third.record.sha256,
      f.root.evidence.inputHash,
    ),
  ).toThrow("exceeds two adaptations");
});

it("roundtrips final integration through both durable parents and rejects later ancestor tampering", () => {
  const f = fixture();
  const first = f.apply(f.root, 1),
    second = f.apply(first.state, 2);
  // Offline conversion/comparison fixture: this verifies record binding, not
  // Roblox conversion or runtime execution, which require separate native tests.
  const conversion = JSON.parse(
    fs.readFileSync(
      path.join(f.directory, f.original.conversionHash + ".conversion.json"),
      "utf8",
    ),
  );
  const previousXml = fs.readFileSync(
    path.join(f.directory, conversion.xmlHash + ".rbxmx"),
    "utf8",
  );
  const currentXml = previousXml.replaceAll(
    xml(f.root.evidence.sourceBodies[0].source),
    xml(second.evidence.sourceBodies[0].source),
  );
  expect(currentXml).not.toBe(previousXml);
  conversion.source = second.record.adapted;
  conversion.xmlHash = hash(currentXml);
  conversion.xmlBytes = Buffer.byteLength(currentXml);
  fs.writeFileSync(
    path.join(f.directory, conversion.xmlHash + ".rbxmx"),
    currentXml,
  );
  const conversionBytes = JSON.stringify(conversion, null, 2) + "\n";
  const conversionHash = hash(conversionBytes);
  fs.writeFileSync(
    path.join(f.directory, conversionHash + ".conversion.json"),
    conversionBytes,
  );
  const review = structuredClone(f.original.review);
  review.packetHash = second.evidence.packetHash;
  review.sources[0].sha256 = second.evidence.sourceBodies[0].sha256;
  review.requirements[0].sourceHashes = [review.sources[0].sha256];
  review.permissionImpacts[0].sourceHashes = [review.sources[0].sha256];
  const reference = persistComponentIntegration(f.directory, {
    preparedHash: f.preparedHash,
    evidence: second.evidence,
    review,
    need: f.original.need,
    scope: "Forge_fixture",
    conversionHash,
    comparison: f.original.comparison,
  });
  const rawIntegration = fs.readFileSync(
    path.join(f.directory, reference.recordHash + ".integration.json"),
    "utf8",
  );
  const loaded = loadComponentIntegration(f.directory, reference);
  expect(loaded.evidence).toEqual(second.evidence);
  expect(loaded.record.preparedHash).toBe(f.preparedHash);
  expect(loaded.record.review).toEqual(review);
  expect(loaded.xml.xml).toBe(currentXml);
  expect(reference.packetHash).toBe(second.record.sha256);
  expect(reference.archiveHash).toBe(second.record.adapted.archiveHash);
  expect(reference.runtimeVerification).toBe("not_performed");
  expect(
    fs.readFileSync(
      path.join(f.directory, reference.recordHash + ".integration.json"),
      "utf8",
    ),
  ).toBe(rawIntegration);
  fs.appendFileSync(first.record.file, " ");
  expect(() => loadComponentIntegration(f.directory, reference)).toThrow(
    "Adaptation record identity mismatch",
  );
  expect(
    fs.readFileSync(
      path.join(f.directory, reference.recordHash + ".integration.json"),
      "utf8",
    ),
  ).toBe(rawIntegration);
});
