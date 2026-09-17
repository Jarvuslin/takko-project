import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { componentReviewFixture } from "./component-review.fixture";
import { persistComponentArchive } from "../src/generation/component-archive";
import { persistComponentDerivative } from "../src/generation/component-derivative";
import { loadComponentReviewEvidence } from "../src/generation/component-review";
import { persistComponentIntegration } from "../src/generation/component-integration";
import { xml } from "../src/generation/export";
import type { AssetNeed } from "../src/generation/asset-contract";
const hash = (x: string) => createHash("sha256").update(x).digest("hex");
// Offline transport/record fixture. Native comparison is simulated, never execution evidence.
export function integrationFixture(
  directory: string,
  scope: string,
  options: {
    need?: AssetNeed;
    inputHash?: string;
    candidateId?: string;
    token?: string;
    runtimeSourceWrite?: boolean;
    runtimeTouch?: boolean;
    media?: { className: string; property: string; value: string }[];
  } = {},
) {
  fs.mkdirSync(directory, { recursive: true });
  const need =
    options.need ??
    ({
      id: "component",
      requirementId: "style",
      role: "Retained behavior",
      kind: "Model",
      query: "component",
      constraints: "Match game",
      required: true,
      position: [10, 2, 3],
      maxSize: 12,
    } as AssetNeed);
  const fixture = componentReviewFixture(
    [need.requirementId],
    options.token ?? "12345678-1234-4234-8234-123456789abc",
  );
  if (options.runtimeSourceWrite) {
    const body = fixture.evidence.sourceBodies[0];
    body.source += '\nscript.Source = "return 1"';
    body.sha256 = hash(body.source);
    fixture.decision.sources[0].sha256 = body.sha256;
    for (const requirement of fixture.decision.requirements)
      requirement.sourceHashes = [body.sha256];
    for (const impact of fixture.decision.permissionImpacts)
      impact.sourceHashes = [body.sha256];
  }
  const nodes = [
    ...fixture.evidence.nodes,
    { index: 4, parentIndex: 1, name: "Part", className: "Part" },
    ...(options.media ?? []).map((media, index) => ({
      index: index + 5,
      parentIndex: 1,
      name: `Media${index}`,
      className: media.className,
    })),
  ];
  const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
  const comparison = {
    passed: true as const,
    checkedProperties: 1,
    checkedAttributes: 0,
    checkedReferences: 0,
    unobservableProperties: [],
    ignoredIdentityProperties: [],
  };
  const sources = fixture.evidence.sourceBodies.flatMap((b) =>
    b.bindings.map((binding) => ({
      ...binding,
      source: b.source,
      sourceBytes: Buffer.byteLength(b.source),
    })),
  );
  const snapshot = {
    status: "captured",
    format: "roblox-native-rbxm-v1",
    engineVersion: "offline",
    base64: bytes.toString("base64"),
    bytes: bytes.length,
    executed: false,
    nodes,
    ...(options.media
      ? {
          contentReferences: options.media.map((media, index) => ({
            index: index + 5,
            property: media.property,
            value: media.value,
          })),
        }
      : {}),
    ...(options.runtimeTouch
      ? {
          runtimeOnlyInstances: [
            {
              parentIndex: 4,
              name: "TouchInterest",
              className: "TouchTransmitter",
              reconstruction: "touch_listener_required_unverified",
            },
          ],
        }
      : {}),
    sources,
    sourceBytes: sources.reduce((n, s) => n + s.sourceBytes, 0),
    roundTrip: comparison,
  };
  const archive = persistComponentArchive(snapshot, directory);
  if (archive.status !== "captured") throw Error("Fixture archive failed");
  const original = {
    archiveHash: archive.sha256,
    manifestHash: path.basename(archive.manifestFile!, ".component.json"),
  };
  const captured = persistComponentDerivative(
    directory,
    original,
    {
      snapshot,
      security: {
        currentCapabilities: ["Basic"],
        instances: nodes.map((n) => ({
          index: n.index,
          sandboxedBefore: true,
          sandboxedAfter: true,
          before: ["Basic", "Network"],
          after: ["Basic"],
          removed: ["Network"],
        })),
      },
    },
    {
      studioId: "fixture-studio",
      scope,
      token: options.token ?? "12345678-1234-4234-8234-123456789abc",
      candidateId: options.candidateId ?? "101",
      inputHash: options.inputHash ?? "f".repeat(64),
    },
  );
  const evidence = loadComponentReviewEvidence(
    directory,
    captured.sha256,
    options.inputHash ?? "f".repeat(64),
  );
  const review = {
    ...fixture.decision,
    packetHash: evidence.packetHash,
    inputHash: evidence.inputHash,
    ...(options.media
      ? {
          serializedMedia: options.media.map((media, index) => ({
            index: index + 5,
            property: media.property,
            value: media.value,
            purpose: "Fixture interaction feedback; playback unverified",
            verification: "unverified" as const,
          })),
        }
      : {}),
  };
  const text = `<roblox version="4"><Item class="Model" referent="0"><Properties><string name="Name">Model</string></Properties>${sources.map((s, i) => `<Item class="Script" referent="${i + 1}"><Properties><string name="Name">${nodes[i + 1].name}</string><ProtectedString name="Source">${xml(s.source)}</ProtectedString></Properties></Item>`).join("")}<Item class="Part" referent="3"><Properties><string name="Name">Part</string></Properties></Item></Item></roblox>`;
  const xmlHash = hash(text),
    conversion = {
      version: 1,
      kind: "takko-component-xml",
      source: {
        archiveHash: captured.derivative.sha256,
        manifestHash: path.basename(
          captured.derivative.manifestFile!,
          ".component.json",
        ),
      },
      xmlHash,
      xmlBytes: Buffer.byteLength(text),
      converter: {
        name: "Rojo",
        version: "7.7.0",
        sha256:
          "d9154aa9b1d5997967565679d107bf719e273f5881c3c9e263fd6fd223d5e81e",
      },
      sourceNativeRestoration: true,
      nativeConversionComparison: "required",
      runtimeVerification: "not_performed",
    };
  const conversionBytes = JSON.stringify(conversion, null, 2) + "\n",
    conversionHash = hash(conversionBytes);
  fs.writeFileSync(path.join(directory, xmlHash + ".rbxmx"), text);
  fs.writeFileSync(
    path.join(directory, conversionHash + ".conversion.json"),
    conversionBytes,
  );
  const component = persistComponentIntegration(directory, {
    preparedHash: evidence.packetHash,
    evidence,
    review,
    need,
    scope,
    conversionHash,
    comparison,
  });
  return {
    component,
    evidence,
    review,
    need,
    comparison,
    conversionHash,
    xmlHash,
    directory,
    bundle: {
      files: [],
      scene: [],
      coverage: [],
      assets: [
        {
          id: need.id,
          requirementId: need.requirementId,
          kind: "model" as const,
          status: "retrieved" as const,
          assetId: evidence.candidateId,
          sourceUrl:
            "https://create.roblox.com/store/asset/" + evidence.candidateId,
          description: need.role,
        },
      ],
    },
  };
}
