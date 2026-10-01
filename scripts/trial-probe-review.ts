// Explicitly authorized P-Review only. Never launch against a user's live service.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Engine, validateReview } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { Configuration, providerIdentity } from "../src/generation/settings";
import { windowsCredentialVault } from "../src/generation/credential-vault";
import { prepareReviewBudget, trialFinalReviewPolicy } from "../src/generation/review-budget";
import { reviewSchema } from "../src/generation/schema";
import { compileSources } from "../src/generation/validation";

const root = path.resolve(process.argv.includes("--dispatch-authorized") ? ".forge/trial-probes/p-review" : ".forge/trial-probes/p-review-offline");
fs.mkdirSync(root, { recursive: true });
const write = (name: string, value: unknown) => fs.writeFileSync(path.join(root, name + ".json"), JSON.stringify(value, null, 2));
const golden = ".forge/trial-rehearsal/native-golden-X5nueF";
const captured = JSON.parse(fs.readFileSync(golden + "/requests.json", "utf8"))
  .map((row: any) => JSON.parse(row.input.body))
  .filter((body: any) => body.reasoning?.effort === "medium" && body.max_tokens === 32768);
assert.equal(captured.length, 1);
const expected = captured[0];
const context = JSON.parse(expected.messages.find((m: any) => m.role === "user").content);
const p = JSON.parse(fs.readFileSync(golden + "/terminal-project.json", "utf8"));
p.id = randomUUID(); p.charges = []; p.events = []; p.reservedMicros = 0;
p.budgetMicros = 1250000; p.jobId = null; p.review = null;
delete p.coordination; delete p.generation; delete p.protectedReview;
const canonical = path.join(process.env.APPDATA!, "Forge Desktop");
const saved = JSON.parse(fs.readFileSync(path.join(canonical, "projects/configuration/models.json"), "utf8"));
const profile = saved.profiles.find((model: any) => model.model === expected.model);
assert.ok(profile, "Golden review model must still be configured");
const config = new Configuration(path.join(root, "configuration"));
config.save({ profiles: [profile], routes: { planner: [profile.id], builder: [profile.id], reviewer: [profile.id], repair: [profile.id] }, budgetMicros: 1250000, repairLimit: 0 });
const store = new GenerationStore(path.join(root, "projects"));
prepareReviewBudget(p, profile, trialFinalReviewPolicy);
store.save(p);
let calls = 0;
let key = "";
const result: any = { label: "Golden final-review policy probe, not a review of a new game", capMicros: 1250000, startedAt: new Date().toISOString(), calls: 0 };
const transport: typeof fetch = async (url, init) => {
  const body = JSON.parse(String(init?.body));
  assert.deepEqual(body, expected, "Current direct-path projection must match the Release A captured request");
  assert.equal(++calls, 1, "One attempt only");
  assert.ok(p.reservedMicros <= 1250000);
  result.preDispatch = { at: new Date().toISOString(), bytes: Buffer.byteLength(String(init?.body)), reservedMicros: p.reservedMicros, remainingCapMicros: 1250000 - p.reservedMicros };
  write("result", result); write("request", body);
  if (!process.argv.includes("--dispatch-authorized")) throw Error("Offline projection checked. No dispatch authorized by this invocation.");
  fs.writeFileSync(path.join(root, "dispatch-once.json"), JSON.stringify(result.preDispatch), { flag: "wx" });
  result.calls = 1;
  const response = await fetch(url, init);
  const raw = await response.clone().json();
  write("response", raw);
  result.httpStatus = response.status; result.usage = raw.usage;
  result.finishReason = raw.choices?.[0]?.finish_reason;
  write("result", result);
  return response;
};
if (process.argv.includes("--dispatch-authorized")) {
  assert.ok(!fs.existsSync(path.join(root, "dispatch-once.json")), "Probe already attempted. No retry permitted.");
  const keys = windowsCredentialVault(path.join(canonical, "provider-keys.dpapi"))!.read();
  key = keys[providerIdentity(profile)]; assert.ok(key);
  const response = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: "Bearer " + key } });
  assert.ok(response.ok, "Read-only balance unavailable");
  const { data } = await response.json();
  result.balanceBefore = { at: new Date().toISOString(), limit: data.limit, remaining: data.limit_remaining, usage: data.usage };
  assert.ok(data.limit_remaining >= 1.25);
  write("result", result);
}
const engine = new Engine(store, config, transport, compileSources, undefined, { finalReview: trialFinalReviewPolicy, maxAttempts: 1, allowFallbacks: false });
try {
  const review = await (engine as any).call(p, "reviewer", context, reviewSchema, config.read(), new Map([[profile.id, key]]), new AbortController().signal,
    async (value: any) => {
      result.parsed = true;
      validateReview(value, p.spec);
      result.compiler = await compileSources({ files: [], scene: [], coverage: [], assets: [] }, value.tests, new AbortController().signal);
      assert.ok(result.compiler.every((check: any) => check.status !== "failed"));
      result.hostValid = true;
    }, undefined, { finalReview: true });
  write("review", review);
} catch (error) { result.error = error instanceof Error ? error.message : "Probe failed"; }
result.charges = p.charges; result.reservedMicros = p.reservedMicros;
result.finishedAt = new Date().toISOString();
if (key) {
  const response = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: "Bearer " + key } });
  if (response.ok) { const { data } = await response.json(); result.balanceAfter = { at: new Date().toISOString(), limit: data.limit, remaining: data.limit_remaining, usage: data.usage }; }
}
write("result", result);
console.log(JSON.stringify(result, null, 2));
