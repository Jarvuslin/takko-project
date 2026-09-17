import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Audits retained tool receipts and file identities; does not perform a fresh Studio test.
const directory = path.resolve(process.argv[2] ?? "research/results/component-configuration-v1");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const cases = ["combat-training", "bubble-wrap", "checkpoint-parkour"];
const rows = [];
for (const format of ["binary", "xml"]) {
  const folder = path.join(directory, "conversion-" + format);
  const result = JSON.parse(fs.readFileSync(path.join(folder, "result.json"), "utf8"));
  assert.equal(result.rojoVersion, "7.7.0");
  assert.equal(result.executableHash, "d9154aa9b1d5997967565679d107bf719e273f5881c3c9e263fd6fd223d5e81e");
  assert.equal(result.paidCalls, 0);
  assert.equal(result.rawGameBenchmark, false);
  assert.deepEqual(result.results.map(row => row.case), cases);
  for (const row of result.results) {
    const xml = fs.readFileSync(path.join(folder, row.case + ".rbxmx"));
    const converted = format === "xml" ? xml : fs.readFileSync(path.join(folder, row.case + ".rbxm"));
    assert.equal(hash(xml), row.xmlHash);
    assert.equal(hash(converted), row.convertedHash);
    const source = fs.readFileSync(path.resolve("docs/results/takko-context-media/native-v1", row.case, row.sourceHash + ".rbxm"));
    assert.equal(hash(source), row.sourceHash);
    assert.equal(row.response.isError, false);
    const receipt = JSON.parse(row.response.content.find(block => block.type === "text").text);
    assert.equal(receipt.cleanup, true);
    assert.equal(receipt.importedCodeExecuted, false);
    assert.equal(receipt.restoredRoots, 2);
    assert.equal(receipt.error, "");
    const counts = { "combat-training": [447, 13, 2, 40], "bubble-wrap": [5981, 0, 76, 750], "checkpoint-parkour": [70, 0, 1, 8] }[row.case];
    assert.deepEqual([receipt.checkedProperties, receipt.checkedReferences, receipt.checkedSources, receipt.checkedSecurity], counts);
    assert.ok(receipt.unobservableProperties.length > 0, "Do not omit unreadable-property limits");
    if (format === "binary" && row.case === "combat-training") {
      assert.equal(receipt.passed, false, "Preserve the observed binary conversion failure");
      assert.equal(receipt.differences.length, 8);
      assert.ok(receipt.differences.every(d => ["C0", "C1"].includes(d.property) && [6, 7, 8, 9].includes(d.index)));
    } else {
      assert.equal(receipt.passed, true);
      assert.deepEqual(receipt.differences, []);
    }
    rows.push({ format, case: row.case, exactReadableComparison: receipt.passed, differences: receipt.differences.length });
  }
}
console.log(JSON.stringify({ retainedEvidenceVerified: true, rows, boundary: "Frozen component conversion only; unreadable engine properties and runtime behavior remain unverified." }, null, 2));
