import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  componentArchiveSnapshotSchema,
  persistComponentArchive,
  componentRuntimeInventoryLuau,
} from "./component-archive";

const hash = (bytes: string | Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const names = z.array(z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/)).max(256);
const securitySchema = z
  .object({
    currentCapabilities: names,
    instances: z
      .array(
        z
          .object({
            index: z.number().int().positive(),
            sandboxedBefore: z.boolean(),
            sandboxedAfter: z.boolean(),
            before: names,
            after: names,
            removed: names,
          })
          .strict(),
      )
      .min(1)
      .max(3000),
  })
  .strict();
export const componentDerivativePayloadSchema = z
  .object({
    snapshot: componentArchiveSnapshotSchema,
    security: securitySchema,
  })
  .strict();

/** Reads only content-addressed files within the configured evidence directory. */
export function readComponentOriginal(
  directory: string,
  archiveHash: string,
  manifestHash: string,
) {
  digest.parse(archiveHash);
  digest.parse(manifestHash);
  if (
    fs.statSync(path.join(directory, manifestHash + ".component.json")).size >
      8 * 1024 * 1024 ||
    fs.statSync(path.join(directory, archiveHash + ".rbxm")).size >
      4 * 1024 * 1024
  )
    throw Error("Original component evidence exceeds size bounds");
  const manifestBytes = fs.readFileSync(
    path.join(directory, manifestHash + ".component.json"),
  );
  if (
    manifestBytes.length > 8 * 1024 * 1024 ||
    hash(manifestBytes) !== manifestHash
  )
    throw Error("Original component manifest identity mismatch");
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const bytes = fs.readFileSync(path.join(directory, archiveHash + ".rbxm"));
  if (hash(bytes) !== archiveHash || manifest.sha256 !== archiveHash)
    throw Error("Original component archive identity mismatch");
  const snapshot = componentArchiveSnapshotSchema.parse({
    status: manifest.status,
    format: manifest.format,
    engineVersion: manifest.engineVersion,
    base64: bytes.toString("base64"),
    bytes: manifest.bytes,
    nodes: manifest.nodes,
    ...(manifest.runtimeOnlyInstances === undefined
      ? {}
      : { runtimeOnlyInstances: manifest.runtimeOnlyInstances }),
    ...(manifest.contentReferences === undefined
      ? {}
      : { contentReferences: manifest.contentReferences }),
    ...(manifest.configurationValues === undefined
      ? {}
      : { configurationValues: manifest.configurationValues }),
    sources: manifest.sources.map(({ sha256, ...source }: any) => {
      if (hash(source.source) !== sha256)
        throw Error("Original source identity mismatch");
      return source;
    }),
    sourceBytes: manifest.sourceBytes,
    roundTrip: manifest.roundTrip,
    executed: manifest.executed,
  });
  const checked = persistComponentArchive(snapshot);
  if (checked.status !== "captured" || checked.sha256 !== archiveHash)
    throw Error("Original component is not a valid complete capture");
  if (snapshot.status !== "captured")
    throw Error("Original archive unavailable");
  return { snapshot, archiveHash, manifestHash };
}

/** A retained derivative is still unreviewed and must not be executed or accepted. */
export function persistComponentDerivative(
  directory: string,
  originalHashes: { archiveHash: string; manifestHash: string },
  raw: unknown,
  binding: {
    studioId: string;
    scope: string;
    token: string;
    candidateId: string;
    inputHash: string;
  },
) {
  const original = readComponentOriginal(
    directory,
    originalHashes.archiveHash,
    originalHashes.manifestHash,
  );
  const { snapshot, security } = componentDerivativePayloadSchema.parse(raw);
  if (snapshot.status !== "captured" || !snapshot.roundTrip.passed)
    throw Error("Restricted component must pass native restoration");
  if (
    !isDeepStrictEqual(snapshot.nodes, original.snapshot.nodes) ||
    !isDeepStrictEqual(snapshot.sources, original.snapshot.sources) ||
    !isDeepStrictEqual(
      snapshot.runtimeOnlyInstances,
      original.snapshot.runtimeOnlyInstances,
    ) ||
    !isDeepStrictEqual(
      snapshot.configurationValues,
      original.snapshot.configurationValues,
    ) ||
    !isDeepStrictEqual(
      snapshot.contentReferences,
      original.snapshot.contentReferences,
    ) ||
    snapshot.sourceBytes !== original.snapshot.sourceBytes ||
    snapshot.engineVersion !== original.snapshot.engineVersion
  )
    throw Error(
      "Restricted component changed hierarchy, source, content references, configuration values or script execution settings",
    );
  const unique = (values: string[]) => new Set(values).size === values.length;
  if (
    !unique(security.currentCapabilities) ||
    security.instances.length !== snapshot.nodes.length
  )
    throw Error("Incomplete component security inventory");
  for (const [i, row] of security.instances.entries()) {
    const removed = row.before
      .filter((name) => !row.after.includes(name))
      .sort();
    const expectedAfter = row.before
      .filter((name) => security.currentCapabilities.includes(name))
      .sort();
    if (
      row.index !== i + 1 ||
      row.sandboxedBefore !== row.sandboxedAfter ||
      !unique(row.before) ||
      !unique(row.after) ||
      !unique(row.removed) ||
      row.after.some(
        (name) =>
          !row.before.includes(name) ||
          !security.currentCapabilities.includes(name),
      ) ||
      !isDeepStrictEqual(removed, [...row.removed].sort()) ||
      !isDeepStrictEqual(expectedAfter, [...row.after].sort())
    )
      throw Error(
        "Restricted component expanded permissions or has inconsistent security evidence",
      );
  }
  const checkedBinding = z
    .object({
      studioId: z.string().min(1).max(100),
      scope: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/),
      token: z.string().uuid(),
      candidateId: z.string().regex(/^\d+$/),
      inputHash: digest,
    })
    .strict()
    .parse(binding);
  // Only persist after the complete identity and reduction checks pass.
  const derivative = persistComponentArchive(snapshot, directory);
  if (derivative.status !== "captured")
    throw Error("Derivative capture unavailable");
  const bodies = new Map<
    string,
    { sha256: string; source: string; bindings: typeof snapshot.sources }
  >();
  for (const source of snapshot.sources) {
    const sha256 = hash(source.source);
    const group = bodies.get(sha256) ?? {
      sha256,
      source: source.source,
      bindings: [],
    };
    if (group.source !== source.source) throw Error("Source digest collision");
    group.bindings.push(source);
    bodies.set(sha256, group);
  }
  const review = {
    version: 1,
    kind: "takko-restricted-component-review",
    binding: checkedBinding,
    original: originalHashes,
    derivative: {
      archiveHash: derivative.sha256,
      manifestHash: path.basename(derivative.manifestFile!, ".component.json"),
    },
    policy: "remove_only_capabilities_unavailable_to_current_thread",
    security,
    nodes: snapshot.nodes,
    ...(snapshot.runtimeOnlyInstances === undefined
      ? {}
      : { runtimeOnlyInstances: snapshot.runtimeOnlyInstances }),
    ...(snapshot.contentReferences === undefined
      ? {}
      : { contentReferences: snapshot.contentReferences }),
    ...(snapshot.configurationValues === undefined
      ? {}
      : { configurationValues: snapshot.configurationValues }),
    sourceBodies: [...bodies.values()].map((group) => ({
      sha256: group.sha256,
      source: group.source,
      bindings: group.bindings.map(({ source: _source, ...entry }) => entry),
    })),
    sourceCount: snapshot.sources.length,
    uniqueSourceBodies: bodies.size,
    securityReview: "not_performed",
    dependencyReview: "not_performed",
    runtimeVerification: "not_performed",
    exportConversion: "not_performed",
    executed: false,
  };
  const bytes = Buffer.from(JSON.stringify(review, null, 2) + "\n");
  const sha256 = hash(bytes),
    reviewFile = path.join(directory, sha256 + ".review.json");
  if (fs.existsSync(reviewFile)) {
    if (!fs.readFileSync(reviewFile).equals(bytes))
      throw Error("Component review filename collision");
  } else fs.writeFileSync(reviewFile, bytes, { flag: "wx" });
  return {
    derivative,
    reviewFile,
    sha256,
    sourceCount: review.sourceCount,
    uniqueSourceBodies: review.uniqueSourceBodies,
    changedInstances: security.instances.filter((row) => row.removed.length)
      .length,
    securityReview: "not_performed" as const,
    runtimeVerification: "not_performed" as const,
  };
}

// Called only after the host has persisted and verified the original capture.
// All comparisons precede reduction; no source, enablement or sandbox is changed.
export const componentRestrictionLuau = String.raw`
${componentRuntimeInventoryLuau}
local function restrictComponentArchive(root, original)
  assert(not game:GetService("RunService"):IsRunning(),"Restriction requires Edit")
  assert(original.status=="captured","Original complete capture required")
  local items,indices,sources,settings={},{},{},{}
  for _,source in original.sources do sources[source.index]=source end
  local function walk(item,parentIndex)
    local index=#items+1
    local expected=assert(original.nodes[index],"Unexpected component instance")
    assert(expected.index==index and expected.parentIndex==parentIndex and expected.name==item.Name and expected.className==item.ClassName,"Original hierarchy changed")
    items[index]=item;indices[item]=index
    settings[index]={sandboxed=item.Sandboxed,capabilities=item.Capabilities}
    local source=sources[index]
    if item:IsA("LuaSourceContainer") then
      assert(source and source.source==item.Source and game:GetService("ScriptEditorService"):GetEditorSource(item)==item.Source,"Original source changed")
      if item:IsA("BaseScript") then
        assert(source.disabled==item.Disabled and source.runContext==tostring(item.RunContext),"Original script execution settings changed")
      end
    else assert(not source,"Original source class changed") end
    for _,child in componentPersistentChildren(item) do walk(child,index) end
  end
  walk(root,0)
  assert(#items==#original.nodes,"Original component instance missing")
  for _,ref in original.contentReferences or {} do
    assert(items[ref.index][ref.property]==ref.value,"Original content reference changed")
  end
  for _,ref in original.configurationValues or {} do
    assert(items[ref.index].Value==ref.value,"Original configuration value changed")
  end
  local current=SecurityCapabilities.fromCurrent()
  local function names(caps)
    local values={}
    for _,cap in Enum.SecurityCapability:GetEnumItems() do if caps:Contains(cap) then table.insert(values,cap.Name) end end
    table.sort(values);return values
  end
  local security={currentCapabilities=names(current),instances={}}
  for index,item in items do
    local before=settings[index].capabilities
    local removed=before:Remove(current);local after=before:Remove(removed)
    assert(before:Contains(after) and current:Contains(after),"Permission expansion refused")
    if before~=after then item.Capabilities=after end
    assert(item.Capabilities==after and item.Sandboxed==settings[index].sandboxed,"Restriction changed security boundary")
    table.insert(security.instances,{index=index,sandboxedBefore=settings[index].sandboxed,sandboxedAfter=item.Sandboxed,before=names(before),after=names(after),removed=names(removed)})
  end
  local snapshot=captureComponentArchive(root)
  assert(not game:GetService("RunService"):IsRunning(),"Studio entered Play")
  return {snapshot=snapshot,security=security}
end
`;
