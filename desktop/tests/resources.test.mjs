import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

test("bundled compiler and AST checker execute from an isolated workspace", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-resource-check-"));
  try {
    const file = path.join(dir, "source.luau");
    fs.writeFileSync(
      file,
      'local target = script.Parent\ntarget.Source = "forbidden"\n',
    );
    const tools = path.resolve("dist-desktop/tools/luau");
    const suffix = process.platform === "win32" ? ".exe" : "";
    const options = {
      cwd: dir,
      windowsHide: true,
      encoding: "utf8",
      timeout: 15000,
    };
    execFileSync(path.join(tools, "luau-compile" + suffix), [file], options);
    const tree = JSON.parse(
      execFileSync(path.join(tools, "luau-ast" + suffix), [file], options),
    );
    assert.match(JSON.stringify(tree), /AstStatAssign/);
    assert.match(JSON.stringify(tree), /Source/);
    const rojo = path.resolve("dist-desktop/tools/rojo/rojo.exe");
    assert.equal(
      createHash("sha256").update(fs.readFileSync(rojo)).digest("hex"),
      "d9154aa9b1d5997967565679d107bf719e273f5881c3c9e263fd6fd223d5e81e",
    );
    assert.match(execFileSync(rojo, ["--version"], options), /7\.7\.0/);
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith("takko-resource-check-"));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
