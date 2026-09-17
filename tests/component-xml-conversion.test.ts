import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import { persistComponentArchive } from "../src/generation/component-archive";
import {
  convertComponentXml,
  loadComponentXml,
} from "../src/generation/component-xml-conversion";
const hash = (v: Buffer | string) =>
  createHash("sha256").update(v).digest("hex");
const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) {
    const real = fs.realpathSync(d);
    if (
      path.dirname(real) !== fs.realpathSync(os.tmpdir()) ||
      !path.basename(real).startsWith("takko-xml-test-")
    )
      throw Error("Unexpected test cleanup path");
    fs.rmSync(real, { recursive: true, force: true });
  }
});
function fixture(passed = true) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "takko-xml-test-"));
  dirs.push(directory);
  const bytes = Buffer.from("<roblox!\x89\xff\r\n\x1a\nfixture", "latin1");
  const archive = persistComponentArchive(
    {
      status: "captured",
      format: "roblox-native-rbxm-v1",
      engineVersion: "offline",
      base64: bytes.toString("base64"),
      bytes: bytes.length,
      executed: false,
      nodes: [
        { index: 1, parentIndex: 0, className: "Model", name: "Imported" },
      ],
      sources: [],
      sourceBytes: 0,
      roundTrip: passed
        ? {
            passed: true,
            checkedProperties: 0,
            checkedAttributes: 0,
            checkedReferences: 0,
            unobservableProperties: [],
            ignoredIdentityProperties: [],
          }
        : { passed: false, stage: "deserialize", reason: "fixture failure" },
    },
    directory,
  );
  if (archive.status !== "captured") throw Error("fixture failed");
  const source = {
    archiveHash: archive.sha256,
    manifestHash: path.basename(archive.manifestFile!, ".component.json"),
  };
  const xml =
    '<roblox version="4"><Item class="Model" referent="0"><Properties><string name="Name">Imported</string></Properties></Item></roblox>';
  const xmlHash = hash(xml);
  const record = {
    version: 1,
    kind: "takko-component-xml",
    source,
    xmlHash,
    xmlBytes: Buffer.byteLength(xml),
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
  fs.writeFileSync(path.join(directory, xmlHash + ".rbxmx"), xml);
  const recordBytes = JSON.stringify(record, null, 2) + "\n",
    recordHash = hash(recordBytes);
  fs.writeFileSync(
    path.join(directory, recordHash + ".conversion.json"),
    recordBytes,
  );
  return { directory, recordHash, source, xmlHash, xml };
}
it("loads bound XML bytes without claiming behavior approval", () => {
  const f = fixture();
  expect(
    loadComponentXml(
      f.directory,
      f.recordHash,
      "Workspace/Forge_Test/Assets/a",
    ),
  ).toEqual({
    destinationPath: "Workspace/Forge_Test/Assets/a",
    xml: f.xml,
    sha256: f.xmlHash,
  });
});
it.each(["record", "xml", "archive", "manifest"])(
  "rejects tampered %s evidence",
  (mode) => {
    const f = fixture();
    const file =
      mode === "record"
        ? f.recordHash + ".conversion.json"
        : mode === "xml"
          ? f.xmlHash + ".rbxmx"
          : mode === "archive"
            ? f.source.archiveHash + ".rbxm"
            : f.source.manifestHash + ".component.json";
    fs.appendFileSync(path.join(f.directory, file), " ");
    expect(() =>
      loadComponentXml(f.directory, f.recordHash, "Workspace/Forge_Test/a"),
    ).toThrow("identity");
  },
);
it("rejects a source without successful native restoration", () => {
  const f = fixture(false);
  expect(() =>
    loadComponentXml(f.directory, f.recordHash, "Workspace/Forge_Test/a"),
  ).toThrow("restoration");
  expect(() =>
    convertComponentXml(f.directory, f.source, "missing.exe"),
  ).toThrow("restoration");
});
it("rejects unverified converter bytes before launching a subprocess", () => {
  const f = fixture(),
    executable = path.join(f.directory, "fake.exe");
  fs.writeFileSync(executable, "not a converter");
  expect(() => convertComponentXml(f.directory, f.source, executable)).toThrow(
    "Unverified component converter",
  );
});
it("rejects record path traversal before reading outside evidence", () => {
  const f = fixture();
  expect(() =>
    loadComponentXml(f.directory, "../other", "Workspace/Forge_Test/a"),
  ).toThrow("identity");
});
