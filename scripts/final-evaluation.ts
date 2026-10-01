import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/server/app";
import { windowsCredentialVault } from "../src/generation/credential-vault";
import { providerIdentity } from "../src/generation/settings";
import { createOpenCodeBackend } from "../src/generation/opencode-runtime";
import { evaluationAdmission } from "../src/generation/evaluation-budget";
import { validateSpec } from "../src/generation/validation";
import { requestedRig } from "../src/generation/rig-policy";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { unpackMarketplace } from "../src/marketplace/studio";
import { isVerifiedEditState } from "../src/generation/studio-state";
import type { Engine } from "../src/generation/engine";
import type { Configuration } from "../src/generation/settings";
import type { Profile } from "../src/generation/schema";
import { finalCases, finalSpec, finalAcceptance } from "./final-evaluation-cases";

assert(process.argv.includes("--dispatch-authorized"), "Explicit authorized invocation required");
const root = path.resolve(".forge/final-evaluation"), reportDir = path.resolve("docs/results/final-evaluation");
fs.mkdirSync(root, { recursive: true }); fs.mkdirSync(reportDir, { recursive: true });
const write = (name: string, value: unknown) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2));
const marker = path.join(root, "session-once.json");
assert(!fs.existsSync(marker), "The authorized batch has already been dispatched. No automatic retry.");
const canonical = path.join(process.env.APPDATA!, "Forge Desktop");
const settings = JSON.parse(fs.readFileSync(path.join(canonical, "projects/configuration/models.json"), "utf8"));
const connected = settings.profiles.find((p: any) => p.provider === "openrouter");
const key = windowsCredentialVault(path.join(canonical, "provider-keys.dpapi"))!.read()[providerIdentity(connected)];
assert(key, "No canonical OpenRouter credential");
async function balance() {
  const response = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: "Bearer " + key }, signal: AbortSignal.timeout(15000) });
  assert(response.ok, "Balance unavailable"); const { data } = await response.json();
  assert(Number.isFinite(data.usage) && Number.isFinite(data.limit_remaining), "Unusable balance");
  return { at: new Date().toISOString(), remaining: data.limit_remaining as number, usage: data.usage as number, limit: data.limit };
}
const initial = await balance(); assert(initial.remaining >= 5, "Balance below authorized cap");
const catalogResponse = await fetch("https://openrouter.ai/api/v1/models"); assert(catalogResponse.ok);
const catalog = (await catalogResponse.json()).data;
const models = ["openai/gpt-6-luna", "anthropic/claude-sonnet-5.5"];
const profiles: Profile[] = models.map(model => {
  const row = catalog.find((r: any) => r.id === model); assert(row?.pricing);
  assert(!Number(row.pricing.request ?? 0), "Request fee needs explicit reservation support");
  const rates = [row.pricing, ...(row.pricing.overrides ?? [])];
  return { id: randomUUID(), name: model, model, provider: "openrouter", baseUrl: "https://openrouter.ai/api/v1", inputRate: Math.max(...rates.flatMap((r: any) => [Number(r.prompt ?? 0), Number(r.input_cache_write ?? 0), Number(r.input_cache_write_1h ?? 0)])) * 1e6, outputRate: Math.max(...rates.map((r: any) => Number(r.completion ?? 0))) * 1e6, maxOutputTokens: 32768, reasoningEffort: "medium", jsonMode: true };
});
write("catalog.json", { at: new Date().toISOString(), models: catalog.filter((r: any) => models.includes(r.id)), conservativeProfiles: profiles });
write("frozen-cases.json", finalCases.map(c => ({ ...c, spec: finalSpec(c, "Forge_FinalContract"), acceptance: finalAcceptance(c, "Forge_FinalContract", 1) })));
const studioId = "d019b9b1-170e-42f8-b76c-704533ef26cd";
const inspector = new StdioStudioClient();
async function studio(code: string) { return unpackMarketplace(await inspector.callTool("execute_luau", { studio_id: studioId, datamodel_type: "Edit", code })); }
assert(isVerifiedEditState(unpackMarketplace(await inspector.callTool("get_studio_state", { studio_id: studioId }))));
const baseline = await studio('local n=0 for _,i in game:GetDescendants() do if i:IsA("LuaSourceContainer") then n+=1 end end return game:GetService("HttpService"):JSONEncode({scripts=n,workspaceChildren=#workspace:GetChildren()})');
assert.equal(baseline.scripts, 0); assert.equal(baseline.workspaceChildren, 2); write("inspection-baseline.json", baseline);
const ids: string[] = [], trials: any[] = [], dispatches: any[] = [];
let currentTrial = -1;
let engine: Engine;
const app = createApp(path.join(root, "projects"), {
  executionPolicy: {
    opencode: createOpenCodeBackend(path.resolve("dist-desktop/tools/opencode/opencode.exe")),
    maxAttempts: 1, allowFallbacks: false,
    beforeDispatch: async request => {
      const observed = await balance();
      const liability = evaluationAdmission(ids.map(id => engine.store.get(id)), 5_000_000, Math.max(0, Math.ceil((observed.usage - initial.usage) * 1e6)));
      assert(dispatches.filter(d => d.trial === currentTrial).length < 20, "Trial turn cap reached before dispatch");
      dispatches.push({ trial: currentTrial, ...request, profile: request.profile.model, at: new Date().toISOString(), liability, balance: observed });
      write("dispatches.json", dispatches);
    },
  },
});
engine = app.locals.engine;
const config: Configuration = app.locals.config;
const server = app.listen(4335, "127.0.0.1");
await new Promise<void>((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
fs.writeFileSync(marker, JSON.stringify({ at: new Date().toISOString(), capMicros: 5_000_000, authorization: "$5 total including failed calls, bounded repairs and escalation", models, cases: finalCases.map(c => c.id) }, null, 2), { flag: "wx" });
function progress() { write("progress.json", { initial, capMicros: 5_000_000, trials, dispatches, projects: ids.map(id => engine.store.get(id)) }); }
function results(balanceAfter: Awaited<ReturnType<typeof balance>>) {
  const projects = ids.map(id => engine.store.get(id));
  const charges = projects.flatMap(p => p.charges.map(c => ({ project: p.id, ...c })));
  const lines = ["# Final evaluation results", "", `Updated ${new Date().toISOString()}. Authorized aggregate cap: $5.`, "", "Production Engine, asset adapter, OpenCode gateway and native acceptance API. Fixed approved specifications. This does not score proposal UX. Asset selection uses the real production search workflow. No external generated-code repairs.", "", "| Trial | Model | Stage | Native | Host charge |", "| --- | --- | --- | --- | --- |", ...trials.map(t => `| ${t.case} | ${t.model} | ${t.stage ?? "running"} | ${t.native?.attempts?.at(-1)?.outcome ?? "not run"} | $${((t.chargedMicros ?? 0) / 1e6).toFixed(6)} |`), "", `Balance before: ${JSON.stringify(initial)}`, `Balance after: ${JSON.stringify(balanceAfter)}`, `Provider usage delta: $${(balanceAfter.usage - initial.usage).toFixed(9)}. Host charged/unknown liability: $${(charges.reduce((n,c)=>n+c.chargedMicros,0)/1e6).toFixed(6)}.`, "", "## Per-call receipts", "", "| UTC | Model | Phase | Input | Output | Reserved USD | Charged USD | Billing |", "| --- | --- | --- | --- | --- | --- | --- | --- |", ...charges.map(c=>`| ${c.at} | ${c.model} | ${c.phase} | ${c.inputTokens} | ${c.outputTokens} | ${(c.reservedMicros/1e6).toFixed(6)} | ${(c.chargedMicros/1e6).toFixed(6)} | ${c.billingSource}${c.estimated?" estimated":""} |`), "", "Raw projects, candidate receipts, native exports and attempts remain in .forge/final-evaluation. The committed report preserves failures and charges. Native animation/audio checks observe playback state, not perceived quality or audio loopback. Neither native acceptance nor static tests establish all game types or multiplayer correctness."];
  fs.writeFileSync(path.join(reportDir, "RESULTS.md"), lines.join("\n") + "\n");
  fs.writeFileSync(path.join(reportDir, "results.json"), JSON.stringify({ initial, balanceAfter, capMicros: 5_000_000, trials, charges, dispatches }, null, 2));
}
try {
  for (const model of profiles) for (const c of finalCases) {
    currentTrial++; config.save({ profiles: [model], routes: { planner: [model.id], builder: [model.id], reviewer: [model.id], repair: [model.id], componentReviewer: [model.id], componentAdapter: [model.id] }, budgetMicros: 5_000_000, generationBudgetMicros: 5_000_000, repairLimit: 1, researchEnabled: false }); config.setKey(model.id, key);
    const p = engine.create(c.request); ids.push(p.id); p.rig = requestedRig(c.rig); p.spec = validateSpec(finalSpec(c, p.scope), p); p.stage = "review"; engine.store.save(p); engine.bindAssetStudio(p.id, p.revision, studioId); engine.approve(p.id, p.revision);
    const trial: any = { case: c.id, model: model.model, projectId: p.id, scope: p.scope, startedAt: new Date().toISOString() }; trials.push(trial); progress(); console.log("START", c.id, model.model, p.id);
    try {
      engine.start(p.id, p.revision, "build"); let result = await engine.wait(p.id);
      if (result.stage === "ready_to_test" && !result.checks.some(check => check.status === "failed")) {
        const response = await fetch(`http://127.0.0.1:4335/api/projects/${p.id}/native-acceptance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalAcceptance(c, p.scope, p.revision)), signal: AbortSignal.timeout(1200000) });
        const native = await response.json(); trial.native = { status: response.status, attempts: native.attempts, error: native.error }; result = engine.store.get(p.id);
      }
      trial.stage = result.stage; trial.error = result.error; trial.failure = result.failure; trial.assetPipeline = { status: result.assetPipeline?.status, entries: result.assetPipeline?.entries.map(e=>({ needId:e.needId,status:e.status,reason:e.reason,selected:e.selected?.id })) }; trial.staticFailures = result.checks.filter(check=>check.status==="failed");
    } catch (error) { trial.error = String(error); trial.stage = engine.store.get(p.id).stage; }
    finally {
      // Only namespaces created by this batch, in its confirmed-empty inspection
      // Studio. Never touches any user game, source archive or saved export.
      trial.cleanup = await studio(`local count=0 for _,name in {"Workspace","ServerStorage","ReplicatedStorage","ServerScriptService","StarterGui"} do local service=game:GetService(name) local root=service:FindFirstChild(${JSON.stringify(p.scope)}) if root then root:Destroy() count+=1 end end local starter=game:GetService("StarterPlayer"):FindFirstChild("StarterPlayerScripts") local root=starter and starter:FindFirstChild(${JSON.stringify(p.scope)}) if root then root:Destroy() count+=1 end return game:GetService("HttpService"):JSONEncode({removedScopes=count})`);
      const result = engine.store.get(p.id); trial.chargedMicros = result.charges.reduce((sum,c)=>sum+c.chargedMicros,0); trial.finishedAt = new Date().toISOString(); trial.balance = await balance(); progress(); results(trial.balance); console.log("END", JSON.stringify(trial));
    }
    const total = ids.map(id=>engine.store.get(id)).flatMap(p=>p.charges).reduce((sum,c)=>sum+c.chargedMicros,0);
    if (total >= 4_800_000 || trial.balance.usage - initial.usage >= 4.8) break;
  }
} finally {
  write("inspection-final.json", await studio('local n=0 for _,i in game:GetDescendants() do if i:IsA("LuaSourceContainer") then n+=1 end end return game:GetService("HttpService"):JSONEncode({scripts=n,workspaceChildren=#workspace:GetChildren()})'));
  await inspector.close(); await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  const final = await balance(); progress(); results(final); console.log("FINISHED", JSON.stringify(final));
}
