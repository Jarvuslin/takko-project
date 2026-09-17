import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { componentArchiveLimits } from "./component-archive";
import {
  expectedAdaptedInventory,
  maxComponentAdaptations,
  validateComponentAdaptation,
  type ComponentAdaptation,
} from "./component-adaptation";
import {
  componentReviewModelEvidence,
  type ComponentReviewEvidence,
} from "./component-review";

const hash = (source: string) =>
  createHash("sha256").update(source).digest("hex");
function inventory(evidence: ComponentReviewEvidence) {
  if (
    !evidence.nodes.length ||
    evidence.nodes.length > componentArchiveLimits.instances ||
    evidence.sourceBodies.length > componentArchiveLimits.scripts
  )
    throw Error("Preservation evidence inventory exceeds bounds");
  const nodes = new Map(evidence.nodes.map((node) => [node.index, node]));
  if (
    nodes.size !== evidence.nodes.length ||
    evidence.nodes.some(
      (node, offset) =>
        node.index !== offset + 1 ||
        (offset === 0
          ? node.parentIndex !== 0
          : !nodes.has(node.parentIndex) || node.parentIndex >= node.index),
    )
  )
    throw Error("Preservation evidence has invalid instance indices");
  const sources = evidence.sourceBodies
    .flatMap((body) => {
      if (hash(body.source) !== body.sha256)
        throw Error("Preservation source hash differs from its body");
      return body.bindings.map((binding) => {
        if (nodes.get(binding.index)?.className !== binding.className)
          throw Error("Preservation source binding differs from its instance");
        return {
          ...binding,
          className: z
            .enum(["Script", "LocalScript", "ModuleScript"])
            .parse(binding.className),
          source: body.source,
          sourceBytes: Buffer.byteLength(body.source),
        };
      });
    })
    .sort((a, b) => a.index - b.index);
  if (
    new Set(sources.map((source) => source.index)).size !== sources.length ||
    sources.length > componentArchiveLimits.scripts ||
    sources.reduce((sum, source) => sum + source.sourceBytes, 0) >
      componentArchiveLimits.sourceBytes
  )
    throw Error("Preservation source bindings exceed bounds or repeat");
  return {
    nodes: evidence.nodes,
    sources,
    contentReferences: evidence.contentReferences,
    configurationValues: evidence.configurationValues,
  };
}

/** A host-checked before/after comparison, never a worker's claimed edit map. */
export function componentPreservationContext(
  before: ComponentReviewEvidence,
  current: ComponentReviewEvidence,
  rawPlan: unknown,
) {
  const plan = validateComponentAdaptation(rawPlan, before);
  if (
    [
      before.packetHash,
      current.packetHash,
      before.inputHash,
      current.inputHash,
      before.originalHash,
      current.originalHash,
      before.derivativeHash,
      current.derivativeHash,
    ].some((value) => !/^[a-f0-9]{64}$/.test(value)) ||
    before.token !== current.token ||
    before.candidateId !== current.candidateId ||
    before.inputHash !== current.inputHash ||
    before.originalHash !== current.originalHash ||
    before.packetHash === current.packetHash ||
    before.derivativeHash === current.derivativeHash
  )
    throw Error(
      "Preservation evidence identities do not describe the same recaptured component",
    );
  const original = inventory(before),
    after = inventory(current);
  const expected = expectedAdaptedInventory(original, plan);
  for (const key of [
    "nodes",
    "sources",
    "contentReferences",
    "configurationValues",
  ] as const)
    if (!isDeepStrictEqual(expected[key], after[key]))
      throw Error(
        "Preservation evidence differs from actually applied plan: " + key,
      );
  const indexMap = expected.indexMap;
  const sourceBindings = original.sources.map((source) => {
    const currentIndex =
      indexMap.find((row) => row.before === source.index)?.after ?? null;
    const surviving = after.sources.find((row) => row.index === currentIndex);
    return {
      beforeIndex: source.index as number | null,
      currentIndex,
      beforeSha256: hash(source.source) as string | null,
      currentSha256: surviving ? hash(surviving.source) : null,
      change: !surviving
        ? "removed"
        : surviving.source === source.source
          ? "preserved"
          : "replaced",
    };
  });
  for (const added of expected.additionMap) {
    const source = after.sources.find((row) => row.index === added.index)!;
    sourceBindings.push({
      beforeIndex: null,
      currentIndex: added.index,
      beforeSha256: null,
      currentSha256: hash(source.source),
      change: "added",
    });
  }
  return structuredClone({
    version: 1 as const,
    before,
    appliedPlan: plan,
    mapping: {
      indexMap,
      removedBeforeIndices: before.nodes
        .filter((node) => !indexMap.some((row) => row.before === node.index))
        .map((node) => node.index),
      addedSources: expected.additionMap.map(({ addition, index }) => ({
        addition,
        currentIndex: index,
      })),
      sourceBindings,
    },
    boundary:
      "before indices/hashes describe the pre-adaptation component; current indices/hashes describe context.evidence. Mapping was checked against recaptured inventory and the applied plan. Plan explanations are worker claims, not proof of preservation. No code execution or gameplay verification is established. Only context.evidence authorizes current review citations and disposition.",
  });
}
type SinglePreservationContext = ReturnType<
  typeof componentPreservationContext
>;
export type ComponentPreservationContext = SinglePreservationContext & {
  original?: ComponentReviewEvidence;
  earlierSteps?: {
    parentPacketHash: string;
    packetHash: string;
    appliedPlan: ComponentAdaptation;
    mapping: SinglePreservationContext["mapping"];
  }[];
  originalMapping?: {
    indexMap: { before: number; after: number }[];
    removedOriginalIndices: number[];
    sourceBindings: SinglePreservationContext["mapping"]["sourceBindings"];
  };
};

/** Flat original/parent/current evidence, with every map verified per actual edit. */
export function componentPreservationChainContext(
  original: ComponentReviewEvidence,
  steps: { plan: ComponentAdaptation; evidence: ComponentReviewEvidence }[],
): ComponentPreservationContext {
  if (
    steps.length < 1 ||
    steps.length > maxComponentAdaptations ||
    new Set([
      original.packetHash,
      ...steps.map((step) => step.evidence.packetHash),
    ]).size !==
      steps.length + 1
  )
    throw Error(
      "Preservation chain requires one or two distinct applied adaptations",
    );
  const first = componentPreservationContext(
    original,
    steps[0].evidence,
    steps[0].plan,
  );
  if (steps.length === 1) return first;
  const current = steps[1].evidence;
  const latest = componentPreservationContext(
    steps[0].evidence,
    current,
    steps[1].plan,
  );
  const indexMap = first.mapping.indexMap.flatMap((row) => {
    const mapped = latest.mapping.indexMap.find(
      (entry) => entry.before === row.after,
    );
    return mapped ? [{ before: row.before, after: mapped.after }] : [];
  });
  const beforeSources = inventory(original).sources;
  const currentSources = inventory(current).sources;
  const sourceBindings: SinglePreservationContext["mapping"]["sourceBindings"] =
    beforeSources.map((source) => {
      const currentIndex =
        indexMap.find((row) => row.before === source.index)?.after ?? null;
      const surviving = currentSources.find(
        (row) => row.index === currentIndex,
      );
      return {
        beforeIndex: source.index,
        currentIndex,
        beforeSha256: hash(source.source),
        currentSha256: surviving ? hash(surviving.source) : null,
        change: !surviving
          ? "removed"
          : surviving.source === source.source
            ? "preserved"
            : "replaced",
      };
    });
  for (const source of currentSources) {
    if (!sourceBindings.some((row) => row.currentIndex === source.index))
      sourceBindings.push({
        beforeIndex: null,
        currentIndex: source.index,
        beforeSha256: null,
        currentSha256: hash(source.source),
        change: "added",
      });
  }
  return structuredClone({
    ...latest,
    original,
    earlierSteps: [
      {
        parentPacketHash: original.packetHash,
        packetHash: steps[0].evidence.packetHash,
        appliedPlan: first.appliedPlan,
        mapping: first.mapping,
      },
    ],
    originalMapping: {
      indexMap,
      removedOriginalIndices: original.nodes
        .filter((node) => !indexMap.some((row) => row.before === node.index))
        .map((node) => node.index),
      sourceBindings,
    },
    boundary:
      latest.boundary +
      " original is the prepared root before either edit; before is the immediate parent of the latest edit. earlierSteps records prior applied plans/maps without nested evidence. originalMapping composes both validated maps. These three index/hash namespaces are distinct; only current context.evidence authorizes review citations.",
  });
}

export function componentPreservationModelContext(
  context: ComponentPreservationContext,
) {
  const sourceReference = <T extends { source: string }>(entry: T) => {
    const { source, ...fields } = entry;
    return { ...fields, sourceSha256: hash(source) };
  };
  const presentPlan = (plan: ComponentPreservationContext["appliedPlan"]) => {
    const { replaceSources, addSources, ...planFields } = plan;
    return {
      ...planFields,
      replaceSources: replaceSources.map(sourceReference),
      ...(addSources === undefined
        ? {}
        : { addSources: addSources.map(sourceReference) }),
    };
  };
  return {
    ...context,
    before: componentReviewModelEvidence(context.before),
    appliedPlan: presentPlan(context.appliedPlan),
    ...(context.original
      ? { original: componentReviewModelEvidence(context.original) }
      : {}),
    ...(context.earlierSteps
      ? {
          earlierSteps: context.earlierSteps.map((step) => ({
            ...step,
            appliedPlan: presentPlan(step.appliedPlan),
          })),
        }
      : {}),
  };
}

export const componentPreservationInstructions =
  "This is a post-adaptation preservation review. Compare preservation.before with current context.evidence using the host-checked mapping and appliedPlan. Before/current indices and source hashes are separate namespaces; appliedPlan replacement/addition sourceSha256 refers to the current numbered source body. When preservation.original is supplied, it is the prepared component before both edits; compare it with current evidence through originalMapping as well as comparing the immediate parent through mapping. earlierSteps records the prior edit without nested source snapshots; its sourceSha256 references are bound to that step's packetHash (the before snapshot), not necessarily to current evidence. Do not let successive edits hide a loss from the original component. Compare useful original behavior, removed interfaces/configuration controls, lifecycle/reset/replay paths, retained media and integration dependencies against actual current sources. Inspect removals and additions as well as replacements; preservation claims and proposed tests are not evidence that behavior survived or works. Report lost useful behavior and remaining integration through the existing reason, behavior, unresolved, requirements and integrationNotes fields; use needs_more_evidence or unsuitable for unresolved loss. Do not approve merely because rewritten code is simpler. All response sources, dependency citations, requirement sourceHashes/nodeIndices and disposition must describe only current context.evidence. Identify original comparisons explicitly in explanatory text, never cite before-only or original-only hashes or indices as current evidence. Do not execute or restore anything, and do not assume gameplay passed.";
