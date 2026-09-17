// Revalidate a failed saved artifact after a validator update; no model call or gameplay edit.
import { GenerationStore } from "../src/generation/store";
import { validateBundle } from "../src/generation/validation";
const store = new GenerationStore(".forge/projects");
const p = store.get(process.argv[2]);
if (p.jobId || p.stage !== "failed" || !p.artifact)
  throw Error(
    "Only an idle failed artifact can be audited by this maintenance tool",
  );
const checks = validateBundle(p.artifact, p);
const failures = checks.filter((check) => check.status === "failed");
if (!failures.length)
  throw Error(
    "Static checks passed; use normal reviewer/Studio flow. This tool cannot mark a project ready.",
  );
store.checkpoint(p);
p.checks = checks;
const missing = failures.filter(
  (check) =>
    check.id.startsWith("unknown-builtin:") ||
    check.id.startsWith("undeclared-asset:"),
);
p.stage = missing.length ? "needs_input" : "failed";
p.error = missing.length
  ? "The generated build references an image or other asset that is not available. Supply a real Roblox asset ID or approve an alternative in the brief, then replan."
  : failures[0].detail;
p.failure = {
  code: missing.length ? "INPUT_REQUIRED" : "SAVED_ARTIFACT_INVALID",
  phase: "builder",
  attempts: 0,
  details: failures.map((check) => check.detail).join("\n"),
  at: new Date().toISOString(),
};
p.events.push({
  at: new Date().toISOString(),
  message:
    "Revalidated the saved artifact against the updated capability and asset catalog. No model call or gameplay edit.",
});
store.save(p);
console.log(
  JSON.stringify({
    id: p.id,
    stage: p.stage,
    failures: failures.map((c) => ({ id: c.id, detail: c.detail })),
  }),
);
