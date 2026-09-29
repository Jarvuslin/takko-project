// Offline feasibility audit. Reads retained evidence, never contacts Studio.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { loadComponentIntegration } from "../../src/generation/component-integration";
import { loadComponentAdaptationChain } from "../../src/generation/component-adaptation";
import { readComponentOriginal } from "../../src/generation/component-derivative";
import { decodeComponentTransfer } from "../../src/generation/component-archive";

const base = "docs/results/takko-component-integration/native-v1";
const rows = [];
for (const name of ["combat-training", "bubble-wrap", "checkpoint-parkour"]) {
  const directory = path.join(base, name);
  const files = fs.readdirSync(directory).filter(f => f.endsWith(".integration.json"));
  assert.equal(files.length, 1);
  const recordHash = path.basename(files[0], ".integration.json");
  const record = JSON.parse(fs.readFileSync(path.join(directory, files[0]), "utf8"));
  const integration = loadComponentIntegration(directory, { recordHash, ...record.metadata });
  const chain = loadComponentAdaptationChain(directory, record.preparedHash, record.metadata.packetHash, record.metadata.inputHash);
  const retained = readComponentOriginal(directory, chain.archive.archiveHash, chain.archive.manifestHash);
  const snapshot = retained.snapshot;
  assert.equal(snapshot.status, "captured");
  if (snapshot.status !== "captured") throw Error("Native archive absent");
  assert.equal(chain.archive.archiveHash, integration.record.metadata.archiveHash);
  const json = JSON.stringify({ componentArchive: snapshot });
  const encoded = Buffer.from(json).toString("base64");
  const transfer = {
    encodedBytes: encoded.length,
    jsonBytes: Buffer.byteLength(json),
    sha256: createHash("sha256").update(encoded).digest("hex"),
    chunkSize: 32768 as const,
  };
  const chunks = encoded.match(/.{1,32768}/g)!;
  assert.deepEqual(decodeComponentTransfer(transfer, chunks), JSON.parse(json));
  assert.throws(() => decodeComponentTransfer(transfer, chunks.slice(1)), /missing or malformed/);
  const damaged = [...chunks];
  damaged[0] = (damaged[0][0] === "A" ? "B" : "A") + damaged[0].slice(1);
  assert.throws(() => decodeComponentTransfer(transfer, damaged), /digest mismatch/);
  rows.push({
    name, recordHash, archiveHash: chain.archive.archiveHash,
    nativeBytes: snapshot.bytes, instances: snapshot.nodes.length,
    sources: snapshot.sources.length, transferChunks: chunks.length,
    integrationRevalidated: true, localChunkRoundTrip: "passed",
    missingChunkRejected: true, corruptChunkRejected: true,
  });
}
const result = {
  checkedAt: new Date().toISOString(),
  kind: "offline-native-delivery-feasibility",
  rows, transferCasesPassed: rows.length * 3,
  nativeStudioCheck: "not_performed_no_connected_studio",
  httpTransfer: "not_performed", productionDelivery: "not_implemented",
  paidCalls: 0, costUsd: 0,
};
const output = process.argv[2];
if (output) fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(result, null, 2));
