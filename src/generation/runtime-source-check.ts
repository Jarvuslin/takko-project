import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

/** AST check for direct protected-source writes; not a sandbox or a full analyzer. */
export function assertNoRuntimeSourceWrites(source: string) {
  const executable = path.resolve(
    process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
    "luau-ast" + (process.platform === "win32" ? ".exe" : ""),
  );
  if (!fs.existsSync(executable))
    throw Error(
      "Luau AST checker unavailable; runtime source validation was not performed",
    );
  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-runtime-source-"),
  );
  try {
    const file = path.join(folder, "input.luau");
    fs.writeFileSync(file, source);
    let ast: unknown;
    try {
      ast = JSON.parse(
        execFileSync(executable, [file], {
          encoding: "utf8",
          windowsHide: true,
          timeout: 15000,
          maxBuffer: 16 * 1024 * 1024,
          stdio: ["ignore", "pipe", "pipe"],
        }),
      );
    } catch {
      throw Error("Runtime source could not be parsed by Luau AST checker");
    }
    const pending: unknown[] = [ast];
    let visited = 0;
    while (pending.length) {
      if (++visited > 500000) throw Error("Runtime source AST exceeds bound");
      const node: any = pending.pop();
      if (!node || typeof node !== "object") continue;
      if (
        node.type === "AstStatAssign" ||
        node.type === "AstStatCompoundAssign"
      ) {
        for (const target of node.vars ?? [node.var]) {
          if (
            (target?.type === "AstExprIndexName" &&
              target.index === "Source") ||
            (target?.type === "AstExprIndexExpr" &&
              target.index?.type === "AstExprConstantString" &&
              target.index.value === "Source")
          )
            throw Error(
              "Runtime assignment to protected Source is unsupported at " +
                target.location +
                ". Create a real script with addSources during Edit; do not write script source during gameplay.",
            );
        }
      }
      for (const value of Object.values(node))
        if (Array.isArray(value)) pending.push(...value);
        else if (value && typeof value === "object") pending.push(value);
    }
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}
