// Execute the real rules/tests against deliberately broken implementations.
// This measures validator sensitivity, not LLM quality or live Studio behavior.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const folder = path.resolve(".forge/guard-evaluation");
fs.mkdirSync(folder, { recursive: true });
const core = fs.readFileSync("recipes/combat/CombatCore.luau", "utf8");
const tests = fs
  .readFileSync("tests/combat.luau", "utf8")
  .replace('require("../recipes/combat/CombatCore")', 'require("./Core")');
fs.writeFileSync(path.join(folder, "tests.luau"), tests);
const binary = path.resolve(
  process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
  process.platform === "win32" ? "luau.exe" : "luau",
);
const cases = [
  { id: "baseline", source: core, expectPass: true },
  {
    id: "missing-cooldown",
    source: core.replace(
      "if now < (state.ready[action] or 0) then",
      "if false then",
    ),
    expectPass: false,
  },
  {
    id: "replay-accepted",
    source: core.replace("or sequence <= state.sequence", ""),
    expectPass: false,
  },
  {
    id: "out-of-range-damage",
    source: core.replace("distance <= range", "true"),
    expectPass: false,
  },
  {
    id: "damage-through-walls",
    source: core.replace("visible == true", "true"),
    expectPass: false,
  },
  {
    id: "dead-player-attacks",
    source: core.replace("if not alive then", "if false then"),
    expectPass: false,
  },
];
const results = [];
for (const entry of cases) {
  if (entry.id !== "baseline" && entry.source === core)
    throw Error("Mutation did not apply: " + entry.id);
  fs.writeFileSync(path.join(folder, "Core.luau"), entry.source);
  const run = spawnSync(binary, [path.join(folder, "tests.luau")], {
    encoding: "utf8",
  });
  if (run.error) throw run.error;
  const passed = run.status === 0;
  results.push({
    id: entry.id,
    passed,
    expectedPass: entry.expectPass,
    matched: passed === entry.expectPass,
  });
}
fs.mkdirSync("test-artifacts", { recursive: true });
fs.writeFileSync(
  "test-artifacts/guard-evaluation.json",
  JSON.stringify(
    {
      ranAt: new Date().toISOString(),
      scope: "offline Luau validator sensitivity; no model calls",
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => !r.matched)) process.exitCode = 1;
