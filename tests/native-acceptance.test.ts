import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { Configuration } from "../src/generation/settings";
import { exportBundle } from "../src/generation/export";
import { NativeAcceptanceRunner, exportManifest, nativeAcceptanceSchema, type NativeRuntime } from "../src/generation/native-acceptance";
import { fakeTransport, profile } from "./generation-fixtures";
import { evaluationAdmission } from "../src/generation/evaluation-budget";
const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });
async function setup(options: { mismatch?: boolean; fails?: boolean; throws?: boolean; stale?: boolean } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-native-acceptance-")); dirs.push(dir);
  const store = new GenerationStore(dir), config = new Configuration(path.join(dir, "configuration")), model = profile();
  config.save({ profiles: [model], routes: { planner: [model.id], builder: [model.id], reviewer: [model.id], repair: [model.id] }, budgetMicros: 2000000, repairLimit: 1 });
  const contexts: any[] = [];
  let currentPhase = "";
  const producer = fakeTransport({ inspect: (phase, context) => { currentPhase = phase; if (phase === "repair") contexts.push(context); } });
  const transport: typeof fetch = async (url, init) => {
    const response = await producer(url, init);
    if (currentPhase !== "repair") return response;
    const payload = await response.json();
    const bundle = JSON.parse(payload.choices[0].message.content);
    bundle.files[0].source = bundle.files[0].source.replace("state.Value = 1", "state.Value = 2");
    payload.choices[0].message.content = JSON.stringify(bundle);
    return Response.json(payload);
  };
  const engine = new Engine(store, config, transport, async () => [], undefined, { maxAttempts: 1, allowFallbacks: false });
  const p = engine.create("Create a racing course");
  engine.start(p.id, p.revision, "plan"); await engine.wait(p.id); engine.approve(p.id, p.revision);
  engine.start(p.id, p.revision, "build"); const built = await engine.wait(p.id);
  expect(built.stage, built.error ?? "").toBe("ready_to_test");
  const calls: string[] = []; let opens = 0, closes = 0, playing = false;
  const runtimeFactory = (): NativeRuntime => ({
    async open(file) {
      opens++; expect(fs.readFileSync(file, "utf8")).toBe(exportBundle(store.get(p.id).artifact!, p.scope, [], p.world, p.rig));
      return "owned-studio";
    },
    async call(name, args) {
      calls.push(name);
      if (name === "get_studio_state") return playing ? { mode: "Play", dataModelTypes: ["Client", "Server"] } : { mode: "Edit", dataModelTypes: ["Edit"] };
      if (name === "start_stop_play") { playing = Boolean(args.is_start); return {}; }
      if (name === "execute_luau") {
        if (args.datamodel_type === "Edit") return { passed: !options.mismatch, detail: "manifest" };
        if (options.stale) { const current = store.get(p.id); current.revision++; store.save(current); }
        if (options.throws) throw Error("native test threw");
        return { passed: !options.fails, detail: "observed runtime value" };
      }
      if (name === "get_console_output") return "native log";
      return {};
    },
    async close() { closes++; },
  });
  const runner = new NativeAcceptanceRunner(engine, dir, runtimeFactory);
  engine.mutationBlocker = id => runner.active.has(id) ? "native busy" : undefined;
  const plan = nativeAcceptanceSchema.parse({ revision: p.revision, steps: [{ id: "loop", description: "observe gameplay", datamodel: "Client", code: "return actualObservation", keys: ["E"] }] });
  return { runner, engine, store, p, plan, calls, contexts, opens: () => opens, closes: () => closes };
}
it("tests the actual producer export, preserves its evidence and returns to Edit", async () => {
  const s = await setup(); const result = await s.runner.run(s.p.id, s.plan);
  expect(result.attempts[0]).toMatchObject({ outcome: "passed", editRestored: true });
  expect(result.project.stage).toBe("ready_to_test");
  expect(result.project.studioEvidence?.checks).toEqual(result.attempts[0].checks);
  expect(s.calls).toContain("user_keyboard_input"); expect(s.closes()).toBe(1);
  expect(s.runner.active.size).toBe(0);
});
it("routes concrete native failure into the real Engine repair once and preserves both attempts", async () => {
  const s = await setup({ fails: true }); const result = await s.runner.run(s.p.id, { ...s.plan, repair: true });
  expect(s.contexts).toHaveLength(1);
  expect(s.contexts[0].studioEvidence.checks[0].id).toBe("loop");
  expect(s.contexts[0].failures.some((c: any) => c.id === "studio:loop")).toBe(true);
  expect(result.attempts.map(a => a.outcome)).toEqual(["failed", "failed"]);
  expect(s.opens()).toBe(2); expect(s.closes()).toBe(2);
  expect(result.attempts[0].exportFile).not.toBe(result.attempts[1].exportFile);
});
it("refuses a mismatching export before Play and never spends on environment repair", async () => {
  const s = await setup({ mismatch: true }); const result = await s.runner.run(s.p.id, { ...s.plan, repair: true });
  expect(result.attempts[0].outcome).toBe("environment_failed"); expect(s.calls).not.toContain("start_stop_play"); expect(s.contexts).toHaveLength(0);
});
it("stops Play and closes its connection when an acceptance script throws", async () => {
  const s = await setup({ throws: true }); const result = await s.runner.run(s.p.id, s.plan);
  expect(result.attempts[0]).toMatchObject({ outcome: "failed", editRestored: true }); expect(s.closes()).toBe(1);
});
it("does not attach stale evidence to a revised project", async () => {
  const s = await setup({ stale: true }); await expect(s.runner.run(s.p.id, s.plan)).rejects.toThrow("obsolete"); expect(s.store.get(s.p.id).studioEvidence).toBeNull(); expect(s.runner.active.size).toBe(0); expect(s.closes()).toBe(1);
});
it("preserves duplicate sibling identities and actual sources in the exported manifest", async () => {
  const s = await setup(); const p = s.store.get(s.p.id); const manifest = exportManifest(exportBundle(p.artifact!, p.scope, [], p.world, p.rig));
  expect(manifest.filter(n => n.source !== undefined).map(n => n.source)).toEqual(p.artifact!.files.map(f => f.source));
  const duplicate = exportManifest('<roblox><Item class="Folder"><Properties><string name="Name">A</string></Properties><Item class="Sound"><Properties><string name="Name">Sound</string></Properties></Item><Item class="Sound"><Properties><string name="Name">Sound</string></Properties></Item></Item></roblox>');
  expect(duplicate.slice(1).map(n => n.address.at(-1)?.ordinal)).toEqual([1, 2]);
});
it("counts actual gateway charges and pending reservations across projects without refunding unknown calls", async () => {
  const s = await setup(); const project = s.store.get(s.p.id);
  const actual = project.charges.reduce((sum, c) => sum + c.chargedMicros, 0);
  expect(actual).toBeGreaterThan(0);
  const pending = { charges: [], reservedMicros: 500 };
  expect(evaluationAdmission([project, pending], actual + 500).remainingMicros).toBe(0);
  expect(() => evaluationAdmission([project, pending], actual + 499)).toThrow("cap exhausted");
  expect(() => evaluationAdmission([project, pending], actual + 500, actual + 1)).toThrow("cap exhausted");
  const unknown = structuredClone(project); unknown.charges[0].estimated = true; unknown.charges[0].inputTokens = null; unknown.charges[0].outputTokens = null;
  expect(evaluationAdmission([unknown], actual).liabilityMicros).toBe(actual);
});
