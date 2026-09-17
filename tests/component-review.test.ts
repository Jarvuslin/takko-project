import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { persistComponentArchive } from "../src/generation/component-archive";
import { persistComponentDerivative } from "../src/generation/component-derivative";
import {
  loadComponentReviewEvidence,
  validateComponentReview,
  componentReviewModelEvidence,
  extractComponentSourceLines,
  componentReviewDecisionSchema,
  componentReviewInstructions,
} from "../src/generation/component-review";
import { componentReviewFixture } from "./component-review.fixture";

const directories: string[] = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((directory) =>
      fs.rmSync(directory, { recursive: true, force: true }),
    ),
);
describe("component source review evidence (offline)", () => {
  function configurationFixture() {
    const { evidence, decision } = componentReviewFixture();
    const source =
      "local target = script.Parent.Target.Value\nrequire(target)\n";
    const sha256 = createHash("sha256").update(source).digest("hex");
    evidence.sourceBodies[0] = { ...evidence.sourceBodies[0], source, sha256 };
    evidence.nodes.push({
      index: 17,
      parentIndex: 1,
      name: "Target",
      className: "NumberValue",
    });
    evidence.configurationValues = [
      { index: 17, property: "Value", value: 2468013579 },
    ];
    decision.sources[0].sha256 = sha256;
    decision.requirements[0].sourceHashes = [sha256];
    decision.permissionImpacts[0].sourceHashes = [sha256];
    decision.sources[0].dependencies = [
      {
        kind: "module_asset",
        value: "2468013579",
        configurationIndex: 17,
        sourceLines: { start: 1, end: 2 },
        verification: "unverified",
      },
    ];
    decision.sources[0].unresolved = [
      "The external module source has not been captured or reviewed",
    ];
    decision.disposition = "needs_more_evidence";
    return { evidence, decision };
  }

  it("advertises the configuration-index kind restriction in both citation modes and instructions", () => {
    const schema = z.toJSONSchema(componentReviewDecisionSchema) as any;
    const modes =
      schema.properties.sources.items.properties.dependencies.items.anyOf;
    expect(modes).toHaveLength(2);
    for (const mode of modes) {
      expect(mode.properties.configurationIndex.description).toContain(
        "Allowed only for kind media_asset or module_asset",
      );
      expect(mode.properties.configurationIndex.description).toContain(
        "Omit for dynamic_or_unresolved",
      );
    }
    expect(componentReviewInstructions).toContain(
      "omit configurationIndex for dynamic_or_unresolved, instance_reference and service",
    );
    expect(componentReviewInstructions).toContain(
      "Do not reclassify an unresolved target merely to attach an index",
    );
  });

  it.each(["dynamic_or_unresolved", "instance_reference", "service"] as const)(
    "rejects a configuration index on %s without suggesting its real captured value is absent",
    (kind) => {
      const { evidence, decision } = configurationFixture();
      const dependency = decision.sources[0].dependencies[0];
      dependency.kind = kind;
      dependency.value = "Unresolved property-to-require data flow";
      const original = structuredClone(decision);
      let message = "";
      try {
        validateComponentReview(decision, evidence, ["style"]);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toContain("dependency[0] (" + kind + ")");
      expect(message).toContain(
        "configurationIndex is allowed only for media_asset or module_asset",
      );
      expect(message).toContain("Do not reclassify an unresolved target");
      expect(message).not.toContain("absent");
      expect(message).not.toContain("does not exactly match");
      expect(decision).toEqual(original);
    },
  );

  it.each(["media_asset", "module_asset"] as const)(
    "accepts exact numeric %s configuration evidence while keeping external verification unresolved",
    (kind) => {
      const { evidence, decision } = configurationFixture();
      decision.sources[0].dependencies[0].kind = kind;
      expect(evidence.sourceBodies[0].source).not.toContain("2468013579");
      expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
        decision,
      );
      expect(decision.sources[0].dependencies[0].verification).toBe(
        "unverified",
      );
      expect(decision.runtimeVerification).toBe("not_performed");
      decision.disposition = "integration_candidate";
      expect(() =>
        validateComponentReview(decision, evidence, ["style"]),
      ).toThrow(
        "Unresolved source or permission dependencies cannot be an integration candidate",
      );
    },
  );

  it("distinguishes missing configuration indices from mismatched existing scalar values", () => {
    const { evidence, decision } = configurationFixture();
    const dependency = decision.sources[0].dependencies[0];
    dependency.configurationIndex = 18;
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow(
      "configurationIndex 18 is absent from captured evidence.configurationValues",
    );
    dependency.configurationIndex = 17;
    dependency.value = "1357924680";
    let message = "";
    try {
      validateComponentReview(decision, evidence, ["style"]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain(
      "value does not exactly match the captured scalar value at configurationIndex 17",
    );
    expect(message).not.toContain("is absent");
    expect(message).not.toContain("allowed only");
  });

  it("preserves dynamic uncertainty without a configuration index and still rejects unsupported integration approval", () => {
    const { evidence, decision } = configurationFixture();
    const dependency = decision.sources[0].dependencies[0];
    dependency.kind = "dynamic_or_unresolved";
    dependency.value =
      "A captured scalar may feed the require call; resolution is unverified";
    delete dependency.configurationIndex;
    const original = structuredClone(decision);
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      original,
    );
    expect(decision).toEqual(original);
    decision.disposition = "integration_candidate";
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("cannot be an integration candidate");
    expect(
      componentReviewDecisionSchema.safeParse({
        ...original,
        runtimeVerification: "performed",
      }).success,
    ).toBe(false);
  });

  it("keeps both unchanged V14 raw reviews rejected with the actionable kind restriction", () => {
    const base =
      "benchmarks/runs/marketplace-diversity-v14-20260916/bubble-wrap";
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-review-v14-"),
    );
    directories.push(directory);
    fs.cpSync(path.join(base, "asset-evidence"), directory, {
      recursive: true,
    });
    const project = JSON.parse(
      fs.readFileSync(path.join(base, "final-project.json"), "utf8"),
    );
    const call = project.assetPipeline.events.find(
      (e: any) => e.step === "component_review_call",
    ).data;
    const evidence = loadComponentReviewEvidence(
      directory,
      call.packetHash,
      call.inputHash,
    );
    const rows = fs
      .readFileSync(path.join(base, "model-events.jsonl"), "utf8")
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line))
      .filter(
        (row) => row.phase === "reviewer" && typeof row.response === "string",
      );
    expect(rows).toHaveLength(2);
    expect(
      evidence.configurationValues!.find((v) => v.index === 17)?.value,
    ).toBe(99292559910041);
    for (const row of rows) {
      const raw = JSON.parse(row.response),
        original = structuredClone(raw);
      const source = raw.sources.find((s: any) => s.sha256.startsWith("699c"));
      expect(source.dependencies[3]).toMatchObject({
        kind: "dynamic_or_unresolved",
        configurationIndex: 17,
      });
      let message = "";
      try {
        validateComponentReview(raw, evidence, call.requirementIds);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toContain(
        `Source ${source.sha256} dependency[3] (dynamic_or_unresolved)`,
      );
      expect(message).toContain(
        "configurationIndex is allowed only for media_asset or module_asset",
      );
      expect(message).not.toContain("configurationIndex 17 is absent");
      expect(raw).toEqual(original);
    }
  });

  it("reports extra permission rows and a misclassified local module together without repairing the raw review", () => {
    const { evidence, decision } = componentReviewFixture();
    const source = "local helper = require(script.Parent.Utility)\n";
    const hash = createHash("sha256").update(source).digest("hex");
    evidence.sourceBodies[0].source = source;
    evidence.sourceBodies[0].sha256 = hash;
    evidence.nodes.push({
      index: 4,
      parentIndex: 1,
      className: "ModuleScript",
      name: "Utility",
    });
    const moduleSource = "return {}";
    const moduleHash = createHash("sha256").update(moduleSource).digest("hex");
    evidence.sourceBodies.push({
      sha256: moduleHash,
      source: moduleSource,
      bindings: [{ index: 4, className: "ModuleScript" }],
    });
    decision.sources[0].sha256 = hash;
    decision.requirements[0].sourceHashes = [hash];
    decision.permissionImpacts[0].sourceHashes = [hash];
    decision.sources[0].dependencies = [
      {
        kind: "module_asset",
        value: "script.Parent.Utility (local ModuleScript index 4)",
        sourceLines: { start: 1, end: 1 },
        verification: "unverified",
      },
    ];
    decision.sources.push({
      sha256: moduleHash,
      behavior: "Returns an empty utility table",
      reuse: "preserve",
      dependencies: [],
      unresolved: [],
    });
    decision.permissionImpacts.push({
      capability: "AssetRead",
      impact: "none_observed",
      reason: "Synthetic extra capability row",
      sourceHashes: [],
    });
    const original = structuredClone(decision);
    let message = "";
    try {
      validateComponentReview(decision, evidence, ["style"]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain(
      'Expected permissionImpacts capabilities: ["Network"]',
    );
    expect(message).toContain(`Source ${hash} dependency[0] (module_asset)`);
    expect(message).toContain("value must be a numeric asset ID");
    expect(message).toContain(
      "Local ModuleScript requires use instance_reference",
    );
    expect(message).not.toContain("ID is not present");
    expect(decision).toEqual(original);
    decision.permissionImpacts.pop();
    decision.sources[0].dependencies[0].kind = "instance_reference";
    const corrected = structuredClone(decision);
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      corrected,
    );
    expect(decision).toEqual(corrected);
  });
  it("distinguishes nonnumeric module values from numeric IDs lacking exact cited evidence", () => {
    const { evidence, decision } = componentReviewFixture();
    decision.sources[0].dependencies[0].kind = "module_asset";
    decision.sources[0].dependencies[0].value = "Utility";
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("must be a numeric asset ID");
    decision.sources[0].dependencies[0].value = "987654";
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("ID is not present");
    decision.sources[0].dependencies[0].kind = "dynamic_or_unresolved";
    decision.sources[0].dependencies[0].value = "Unresolved target expression";
    decision.sources[0].unresolved = ["Runtime target unavailable"];
    decision.disposition = "needs_more_evidence";
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      decision,
    );
  });
  it("bounds combined diagnostics below the correction payload limit while preserving rejection beyond the display cap", () => {
    const { evidence, decision } = componentReviewFixture();
    decision.sources[0].dependencies = Array.from({ length: 12 }, () => ({
      kind: "module_asset",
      value: "Utility",
      sourceLines: { start: 1, end: 1 },
      verification: "unverified",
    }));
    decision.requirements[0].status = "unknown";
    let message = "";
    try {
      validateComponentReview(decision, evidence, ["style"]);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("additional validation issues omitted");
    expect(message.length).toBeLessThan(3000);
    decision.sources[0].dependencies.splice(0, 6);
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("numeric asset ID");
    decision.sources[0].dependencies = [];
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("cannot be an integration candidate");
  });
  it("rejects unknown source hashes safely and fails fast on foreign packet identity", () => {
    const { evidence, decision } = componentReviewFixture();
    decision.sources[0].sha256 = "0".repeat(64);
    decision.permissionImpacts = [];
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("every unique source body");
    decision.packetHash = "1".repeat(64);
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow(
      /^Component review is bound to different evidence or game context$/,
    );
    decision.sources[0].sha256 = "malformed";
    expect(componentReviewDecisionSchema.safeParse(decision).success).toBe(
      false,
    );
  });
  it("advertises local-module classification and the exact removed-permission boundary", () => {
    const schema = JSON.stringify(
      z.toJSONSchema(componentReviewDecisionSchema),
    );
    expect(schema).toContain(
      "instance_reference includes local ModuleScript require targets",
    );
    expect(schema).toContain(
      "One exact member of evidence.removedCapabilities",
    );
    expect(componentReviewInstructions).toContain(
      "A local ModuleScript require target uses kind instance_reference",
    );
    expect(componentReviewInstructions).toContain(
      "permissionImpacts must contain exactly",
    );
  });
  it("resolves inclusive line citations without changing their durable decision shape", () => {
    const { evidence, decision } = componentReviewFixture();
    const dependency = decision.sources[0].dependencies[0];
    if (!("sourceQuote" in dependency)) throw Error("Expected legacy fixture");
    const { sourceQuote: _quote, ...fields } = dependency;
    decision.sources[0].dependencies[0] = {
      ...fields,
      sourceLines: { start: 2, end: 2 },
    };
    const original = structuredClone(decision);
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      original,
    );
    expect(decision).toEqual(original);
    expect(decision.sources[0].dependencies[0]).not.toHaveProperty(
      "sourceQuote",
    );
    decision.sources[0].dependencies[0].value = "999";
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("dependency[0]");
    decision.sources[0].sha256 = "0".repeat(64);
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("every unique source");
  });
  it("preserves CRLF, CR, LF, indentation and Unicode exactly, with no duplicate source body in presentation", () => {
    const source = "local π = 1\r\n\tprint(π)\r-- third\n";
    expect(extractComponentSourceLines(source, { start: 1, end: 2 })).toBe(
      "local π = 1\r\n\tprint(π)\r",
    );
    expect(extractComponentSourceLines(source, { start: 3, end: 3 })).toBe(
      "-- third\n",
    );
    expect(() =>
      extractComponentSourceLines(source, { start: 4, end: 4 }),
    ).toThrow("within 1..3");
    const { evidence } = componentReviewFixture();
    evidence.sourceBodies[0].source = source;
    evidence.sourceBodies[0].sha256 = createHash("sha256")
      .update(source)
      .digest("hex");
    const before = structuredClone(evidence);
    const model = componentReviewModelEvidence(evidence);
    expect(model.sourceBodies[0]).not.toHaveProperty("source");
    expect(model.sourceBodies[0]).toMatchObject({
      lineCount: 3,
      numberedSource: "1: local π = 1\r\n2: \tprint(π)\r3: -- third\n",
      sha256: evidence.sourceBodies[0].sha256,
    });
    expect(evidence).toEqual(before);
  });
  it.each([
    ["zero", "line", { start: 0, end: 1 }],
    ["fractional", "line", { start: 1, end: 1.5 }],
    ["reversed", "one\ntwo", { start: 2, end: 1 }],
    ["out of bounds", "line", { start: 1, end: 2 }],
    ["empty source", "", { start: 1, end: 1 }],
    ["empty range object", "line", {}],
    ["blank only", "one\n \t\r\nthree", { start: 2, end: 2 }],
    ["overlong", "x".repeat(1501), { start: 1, end: 1 }],
    [
      "multiple ranges",
      "one\ntwo",
      [
        { start: 1, end: 1 },
        { start: 2, end: 2 },
      ],
    ],
  ])("rejects %s line citations", (_name, source, range) => {
    expect(() =>
      extractComponentSourceLines(source as string, range),
    ).toThrow();
  });
  it("requires exactly one citation mode and exposes both strict modes in the model schema", () => {
    const { decision } = componentReviewFixture();
    const dependency: any = decision.sources[0].dependencies[0];
    dependency.sourceLines = { start: 2, end: 2 };
    expect(componentReviewDecisionSchema.safeParse(decision).success).toBe(
      false,
    );
    delete dependency.sourceQuote;
    expect(componentReviewDecisionSchema.safeParse(decision).success).toBe(
      true,
    );
    delete dependency.sourceLines;
    expect(componentReviewDecisionSchema.safeParse(decision).success).toBe(
      false,
    );
    const schema = JSON.stringify(
      z.toJSONSchema(componentReviewDecisionSchema),
    );
    expect(schema).toContain('"sourceLines"');
    expect(schema).toContain('"sourceQuote"');
    expect(schema).toContain('"anyOf"');
  });
  it("never treats a presentation line number as a cited numeric asset ID", () => {
    const { evidence, decision } = componentReviewFixture();
    decision.sources[0].dependencies[0] = {
      kind: "media_asset",
      value: "2",
      sourceLines: { start: 2, end: 2 },
      verification: "unverified",
    };
    expect(
      componentReviewModelEvidence(evidence).sourceBodies[0].numberedSource,
    ).toContain("2: sound.SoundId");
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("ID is not present");
  });
  it("continues rejecting spliced legacy quotations with an exact source and dependency diagnostic", () => {
    const { evidence, decision } = componentReviewFixture();
    const originalSource = evidence.sourceBodies[0].source;
    const source = originalSource.replace("\n", "\n-- intervening source\n");
    const hash = createHash("sha256").update(source).digest("hex");
    evidence.sourceBodies[0] = {
      ...evidence.sourceBodies[0],
      source,
      sha256: hash,
    };
    decision.sources[0].sha256 = hash;
    decision.requirements[0].sourceHashes = [hash];
    decision.permissionImpacts[0].sourceHashes = [hash];
    decision.sources[0].dependencies[0] = {
      kind: "media_asset",
      value: "123",
      sourceQuote: originalSource,
      verification: "unverified",
    };
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow(`Source ${hash} dependency[0]`);
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("do not join separated lines");
    decision.sources[0].dependencies[0] = {
      kind: "media_asset",
      value: "123",
      sourceLines: { start: 1, end: 3 },
      verification: "unverified",
    };
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      decision,
    );
  });
  it("retains exact sources and every instance binding from verified originals/derivatives", () => {
    const { evidence } = componentReviewFixture(["style"], randomUUID());
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-review-"));
    directories.push(directory);
    const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
    const sources = evidence.sourceBodies.flatMap((body) =>
      body.bindings.map((binding) => ({
        ...binding,
        source: body.source,
        sourceBytes: Buffer.byteLength(body.source),
      })),
    );
    const snapshot = {
      status: "captured",
      format: "roblox-native-rbxm-v1",
      engineVersion: "offline-fixture",
      bytes: bytes.length,
      base64: bytes.toString("base64"),
      nodes: evidence.nodes,
      sources,
      sourceBytes: sources.reduce((n, s) => n + s.sourceBytes, 0),
      executed: false,
      roundTrip: {
        passed: true,
        checkedProperties: 0,
        checkedAttributes: 0,
        checkedReferences: 0,
        unobservableProperties: [],
        ignoredIdentityProperties: [],
      },
    };
    const original = persistComponentArchive(snapshot, directory);
    if (original.status !== "captured") throw Error("Missing fixture");
    const restricted = persistComponentDerivative(
      directory,
      {
        archiveHash: original.sha256,
        manifestHash: path.basename(original.manifestFile!, ".component.json"),
      },
      {
        snapshot,
        security: {
          currentCapabilities: ["Basic"],
          instances: evidence.nodes.map((node) => ({
            index: node.index,
            sandboxedBefore: true,
            sandboxedAfter: true,
            before: ["Basic", "Network"],
            after: ["Basic"],
            removed: ["Network"],
          })),
        },
      },
      {
        studioId: "offline",
        scope: "Test",
        token: evidence.token,
        candidateId: "101",
        inputHash: evidence.inputHash,
      },
    );
    const loaded = loadComponentReviewEvidence(
      directory,
      restricted.sha256,
      evidence.inputHash,
    );
    expect(loaded.sourceBodies).toEqual(evidence.sourceBodies);
    expect(loaded.removedCapabilities).toEqual(["Network"]);
    expect(loaded.boundary).toContain("NOT established");
    expect(() =>
      loadComponentReviewEvidence(directory, restricted.sha256, "d".repeat(64)),
    ).toThrow("context");
    fs.appendFileSync(restricted.reviewFile, " ");
    expect(() =>
      loadComponentReviewEvidence(
        directory,
        restricted.sha256,
        evidence.inputHash,
      ),
    ).toThrow("identity");
  });
  it("accepts a fully bound static recommendation without treating it as execution proof", () => {
    const { evidence, decision } = componentReviewFixture(["style", "timing"]);
    expect(
      validateComponentReview(decision, evidence, ["style", "timing"]),
    ).toEqual(decision);
    expect(decision.runtimeVerification).toBe("not_performed");
  });
  it("gives actionable disposition feedback when a proposed adaptation has not resolved captured code", () => {
    const { evidence, decision } = componentReviewFixture();
    decision.sources[0].unresolved = ["External module identity unknown"];
    decision.integrationNotes = [
      "Remove the external loader before any execution",
    ];
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow("needs_more_evidence or unsuitable");
    decision.disposition = "needs_more_evidence";
    expect(validateComponentReview(decision, evidence, ["style"])).toEqual(
      decision,
    );
    expect(decision.sources[0].unresolved).toHaveLength(1);
    expect(decision.runtimeVerification).toBe("not_performed");
  });
  it.each([
    [
      "missing source",
      (d: any) => {
        d.sources = [];
      },
    ],
    [
      "duplicate source",
      (d: any) => {
        d.sources.push(d.sources[0]);
      },
    ],
    [
      "wrong packet",
      (d: any) => {
        d.packetHash = "b".repeat(64);
      },
    ],
    [
      "wrong intent",
      (d: any) => {
        d.inputHash = "b".repeat(64);
      },
    ],
    [
      "missing requirement",
      (d: any) => {
        d.requirements = [];
      },
    ],
    [
      "invented requirement",
      (d: any) => {
        d.requirements[0].requirementId = "invented";
      },
    ],
    [
      "invented quote",
      (d: any) => {
        d.sources[0].dependencies[0].sourceQuote = "HttpService:GetAsync(url)";
      },
    ],
    [
      "invented asset ID",
      (d: any) => {
        d.sources[0].dependencies[0].value = "999";
      },
    ],
    [
      "unknown source citation",
      (d: any) => {
        d.requirements[0].sourceHashes = ["0".repeat(64)];
      },
    ],
    [
      "unknown instance",
      (d: any) => {
        d.requirements[0].nodeIndices = [100];
      },
    ],
    [
      "unsupported static claim",
      (d: any) => {
        d.requirements[0].status = "static_evidence_present";
        d.requirements[0].sourceHashes = [];
        d.requirements[0].nodeIndices = [];
      },
    ],
    [
      "missing permission impact",
      (d: any) => {
        d.permissionImpacts = [];
      },
    ],
    [
      "ignored permission incompatibility",
      (d: any) => {
        d.permissionImpacts[0].impact = "required_by_source";
      },
    ],
    [
      "ignored unknown source",
      (d: any) => {
        d.sources[0].unresolved = ["Unknown dynamic dependency"];
      },
    ],
    [
      "fabricated runtime proof",
      (d: any) => {
        d.runtimeVerification = "passed";
      },
    ],
  ] as const)("rejects %s", (_label, mutate) => {
    const { evidence, decision } = componentReviewFixture();
    mutate(decision);
    expect(() =>
      validateComponentReview(decision, evidence, ["style"]),
    ).toThrow();
  });
  it("allows an honest unknown with explicit missing evidence", () => {
    const { evidence, decision } = componentReviewFixture();
    decision.disposition = "needs_more_evidence";
    decision.permissionImpacts[0].impact = "unknown";
    expect(
      validateComponentReview(decision, evidence, ["style"]).disposition,
    ).toBe("needs_more_evidence");
  });
});
