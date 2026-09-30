import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readComponentOriginal } from "./component-derivative";
import type { NativeComponentXml } from "./component-xml";

const hash = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");
const digest = /^[a-f0-9]{64}$/;
const rojoSha256 =
  "d9154aa9b1d5997967565679d107bf719e273f5881c3c9e263fd6fd223d5e81e";
function writeContent(file: string, bytes: Buffer | string) {
  if (fs.existsSync(file)) {
    if (!fs.readFileSync(file).equals(Buffer.from(bytes)))
      throw Error("Component conversion evidence collision");
  } else fs.writeFileSync(file, bytes, { flag: "wx" });
}
/** Conversion retains source bytes/settings; it does not approve execution or behavior. */
export function convertComponentXml(
  directory: string,
  source: { archiveHash: string; manifestHash: string },
  executable = process.env.FORGE_ROJO_BINARY ?? path.resolve(".forge/tools/rojo-7.7.0/rojo.exe"),
) {
  const original = readComponentOriginal(
    directory,
    source.archiveHash,
    source.manifestHash,
  );
  if (!original.snapshot.roundTrip.passed)
    throw Error("Native source restoration must pass before conversion");
  if (hash(fs.readFileSync(executable)) !== rojoSha256)
    throw Error("Unverified component converter executable");
  const temporary = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-component-xml-"),
  );
  try {
    // Use the verified bytes, not a mutable path handed to the subprocess later.
    fs.writeFileSync(
      path.join(temporary, "input.rbxm"),
      Buffer.from(original.snapshot.base64, "base64"),
    );
    const project = path.join(temporary, "default.project.json"),
      output = path.join(temporary, "component.rbxmx");
    fs.writeFileSync(
      project,
      JSON.stringify({
        name: original.snapshot.nodes[0].name,
        tree: { $path: "input.rbxm" },
      }),
    );
    execFileSync(
      executable,
      ["build", project, "-o", output, "--color", "never"],
      { windowsHide: true, timeout: 30000, maxBuffer: 1024 * 1024 },
    );
    if (fs.statSync(output).size > 16 * 1024 * 1024)
      throw Error("Converted XML exceeds bound");
    const xml = fs.readFileSync(output),
      xmlHash = hash(xml);
    const record = {
      version: 1,
      kind: "takko-component-xml",
      source,
      xmlHash,
      xmlBytes: xml.length,
      converter: { name: "Rojo", version: "7.7.0", sha256: rojoSha256 },
      sourceNativeRestoration: true,
      nativeConversionComparison: "required",
      runtimeVerification: "not_performed",
    };
    const bytes = JSON.stringify(record, null, 2) + "\n",
      recordHash = hash(bytes);
    writeContent(path.join(directory, xmlHash + ".rbxmx"), xml);
    writeContent(path.join(directory, recordHash + ".conversion.json"), bytes);
    return { recordHash, ...record };
  } finally {
    const resolved = fs.realpathSync(temporary);
    if (
      path.dirname(resolved) !== fs.realpathSync(os.tmpdir()) ||
      !path.basename(resolved).startsWith("takko-component-xml-")
    )
      throw Error("Temporary conversion cleanup escaped its owned directory");
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}
export function loadComponentXml(
  directory: string,
  recordHash: string,
  destinationPath: string,
): NativeComponentXml {
  if (!digest.test(recordHash))
    throw Error("Invalid component conversion identity");
  const file = path.join(directory, recordHash + ".conversion.json");
  if (fs.statSync(file).size > 16384)
    throw Error("Conversion record exceeds bound");
  const bytes = fs.readFileSync(file);
  if (hash(bytes) !== recordHash)
    throw Error("Conversion record identity mismatch");
  const record = JSON.parse(bytes.toString("utf8"));
  if (
    record.version !== 1 ||
    record.kind !== "takko-component-xml" ||
    !digest.test(record.xmlHash) ||
    record.converter?.sha256 !== rojoSha256 ||
    record.converter?.version !== "7.7.0" ||
    record.sourceNativeRestoration !== true
  )
    throw Error("Unsupported conversion record");
  const original = readComponentOriginal(
    directory,
    record.source.archiveHash,
    record.source.manifestHash,
  );
  if (!original.snapshot.roundTrip.passed)
    throw Error("Conversion source restoration has not passed");
  const xmlFile = path.join(directory, record.xmlHash + ".rbxmx");
  if (fs.statSync(xmlFile).size > 16 * 1024 * 1024)
    throw Error("Converted XML exceeds bound");
  const xml = fs.readFileSync(xmlFile);
  if (xml.length !== record.xmlBytes || hash(xml) !== record.xmlHash)
    throw Error("Converted XML identity mismatch");
  return { destinationPath, xml: xml.toString("utf8"), sha256: record.xmlHash };
}
