// One authorized scoped model-code-quality session on known assets. Not generality.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { z } from "zod";
import { newProject, GenerationStore } from "../src/generation/store";
import { providerIdentity } from "../src/generation/settings";
import { windowsCredentialVault } from "../src/generation/credential-vault";
import { createOpenCodeBackend } from "../src/generation/opencode-runtime";
import { animationCapabilityContract } from "../src/marketplace/selected-clip-context";
import { bundleSchema } from "../src/generation/schema";
import { compileSources } from "../src/generation/validation";

assert.ok(process.argv.includes("--dispatch-authorized"), "Explicit paid invocation required");
const root = path.resolve(".forge/trial-probes/p-build");
fs.mkdirSync(root, { recursive: true });
assert.ok(!fs.existsSync(path.join(root, "session-once.json")), "No retry permitted");
const write = (name: string, value: unknown) => fs.writeFileSync(path.join(root, name + ".json"), JSON.stringify(value, null, 2));
const canonical = path.join(process.env.APPDATA!, "Forge Desktop");
const settings = JSON.parse(fs.readFileSync(path.join(canonical, "projects/configuration/models.json"), "utf8"));
const profile = settings.profiles.find((p: any) => p.id === settings.routes.builder[0]);
assert.equal(profile.model, "anthropic/claude-sonnet-5.5");
const key = windowsCredentialVault(path.join(canonical, "provider-keys.dpapi"))!.read()[providerIdentity(profile)];
assert.ok(key);
async function balance() {
  const response = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: "Bearer " + key } });
  assert.ok(response.ok);
  const { data } = await response.json();
  return { at: new Date().toISOString(), remaining: data.limit_remaining, usage: data.usage, limit: data.limit };
}
const result: any = { label: "Model code-quality probe on known assets, not asset generality", capMicros: 1750000, startedAt: new Date().toISOString(), balanceBefore: await balance(), dispatches: [] };
assert.ok(result.balanceBefore.remaining >= 1.75);
const p = newProject("Implement only the accepted 13-segment R6 combo, client input/playback, server hit authority and remote wiring against the straw target. This is a model code-quality probe on known assets, not asset generality.", 1750000);
const store = new GenerationStore(path.join(root, "projects")); store.save(p);
const trial = JSON.parse(fs.readFileSync("docs/results/trial-failure-diagnosis/trial-proposal.json", "utf8"));
const evidence = {
  scope: p.scope,
  trial,
  animationCapabilityContract,
  rig: "R6",
  assetStatus: "Native structure validated. Complete 13-segment behavior is not yet verified.",
  playback: { retainedSequence: `ReplicatedStorage/${p.scope}/PunchSequence`, target: `Workspace/${p.scope}/StrawTarget` },
  policies: { graceSeconds: 0.35, resetFadeSeconds: 0.08, earlyRequestSeconds: 0.1, range: 6, minimumFacingDot: 0.25 },
  testInterface: "Provide a pure ModuleScript Combo with client(segments,options?), click(client,now), tick(client,now), playback(client,track), server(segments,options?), accept(server,nonce,index,now), hit(server,nonce,now,serverComputedTarget,index?), finish(server,now), cancel(server), death(client,server,now). Segment fields start,hit,finish. Client observable index (0 idle), active, position, holdAt, buffered, hits (indices), fadeUntil. Server observable nonce(initial 1), alive, endAt, pending.hitAt, pendingBySegment, counter. Target fields id,alive,inScope,distance,facing,lineOfSight must be computed only by server wiring. No Roblox globals at module load so offline Luau can import it. Client and server runtime scripts must actually use this module. This interface is for parameterized tests, not supplied implementation.",
  restrictions: "No rest of game, HUD, sound, VFX, asset replacement or paid asset decisions. Do not supply assets or scene nodes. Native harness installs the selected sequence and stationary target. Register raw sequence in Studio and assign temporary ID unchanged. Use a RemoteEvent under ReplicatedStorage scope, created by server, waited for by client. All source paths must use scope. Include lifecycle/respawn cleanup. The target has no Humanoid, so use its physical parts and maintain server hit counter. Never accept client-provided target validity or hit time.",
};
write("context", evidence);
let submitted: z.infer<typeof bundleSchema> | undefined;
const responses: Promise<void>[] = [];
const backend = createOpenCodeBackend(path.resolve("dist-desktop/tools/opencode/opencode.exe"));
backend.preflight();
fs.writeFileSync(path.join(root, "session-once.json"), JSON.stringify({ at: result.startedAt, capMicros: 1750000 }), { flag: "wx" });
try {
  await backend.run({ project: p, store, profile, key, phase: "builder", signal: new AbortController().signal,
    transport: async (url, init) => {
      const index = result.dispatches.length + 1;
      const record: any = { index, at: new Date().toISOString(), bytes: Buffer.byteLength(String(init?.body)), reservedMicros: p.reservedMicros, remainingCapMicros: 1750000 - p.reservedMicros - p.charges.reduce((s, c) => s + c.chargedMicros, 0) };
      result.dispatches.push(record); write("result", result);
      write(`request-${index}`, JSON.parse(String(init?.body)));
      const response = await fetch(url, init);
      // Retain provider payload without request headers. The gateway bills the original stream.
      const copy = response.clone();
      responses.push(copy.text().then(text => fs.writeFileSync(path.join(root, `response-${index}.txt`), text)));
      return response;
    },
    tools: [
      { name: "task_context", description: "Read the real approved assets, accepted timings, G3 guidance and scoped test interface.", schema: z.object({}).strict(), execute: () => evidence },
      { name: "submit_task", description: "Submit all scoped Luau sources once as a bundle. Keep scene, assets and coverage empty. Host records unmodified code and compiler results.", schema: bundleSchema, execute: async (bundle) => {
        assert.ok(!submitted, "Only one final submission");
        assert.equal(bundle.scene.length, 0); assert.equal(bundle.assets.length, 0);
        submitted = bundle; write("model-bundle", submitted);
        result.compiler = await compileSources(bundle, [], new AbortController().signal);
        return { saved: true, instruction: "Finish now. No repair or additional submission is authorized." };
      } },
    ], prompt: "Model code-quality probe on known assets, not asset generality. Read task_context, implement the scoped combo and submit_task once. Do not claim native gameplay was tested.",
    finished: () => submitted !== undefined, progress: () => submitted ? "Scoped code submitted" : "Scoped combo implementation pending",
  });
} catch (error) { result.error = error instanceof Error ? error.message : "Scoped session failed"; }
await Promise.allSettled(responses);
result.charges = p.charges; result.runs = p.opencodeRuns;
result.reservedMicros = p.reservedMicros; result.finishedAt = new Date().toISOString();
result.balanceAfter = await balance(); write("result", result);
console.log(JSON.stringify(result, null, 2));
