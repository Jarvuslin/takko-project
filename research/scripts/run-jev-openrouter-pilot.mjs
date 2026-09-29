import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  cases,
  model,
  manifestHash,
  ceilingNanoUsd,
  reservationNanoUsd,
  runPilot,
} from "./jev-asset-pilot.mjs";

const directory = path.resolve("research/results/jev-asset-pilot-v1");
fs.mkdirSync(directory, { recursive: true });
let key = "";
const save = (name, data) =>
  fs.writeFileSync(path.join(directory, name), JSON.stringify(data, null, 2));
try {
  if (fs.existsSync(path.join(directory, "attempted.lock")))
    throw Error("This pilot has already been attempted. No repeat permitted.");
  try {
    key = execFileSync(
      "pwsh.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "$taskSecure=ConvertTo-SecureString ([IO.File]::ReadAllText((Join-Path $env:LOCALAPPDATA 'Takko\\secrets\\openrouter-testing.dpapi'))); $taskPtr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecure); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPtr))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPtr)}",
      ],
      {
        windowsHide: true,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
  } catch {
    throw Error(
      "Could not restore the encrypted testing credential. Details suppressed.",
    );
  }
  const balance = async () => {
    const response = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: "Bearer " + key },
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    if (!response.ok) throw Error("Could not read OpenRouter key allowance");
    const { data } = await response.json();
    if (!Number.isFinite(data?.limit_remaining))
      throw Error("Key allowance is not available");
    return {
      at: new Date().toISOString(),
      remaining: data.limit_remaining,
      usage: data.usage,
      limit: data.limit,
    };
  };
  const before = await balance();
  save("key-before.json", before);
  if (before.remaining < ceilingNanoUsd / 1e9)
    throw Error("Insufficient key allowance for the capped run");
  const response = await fetch(
    "https://openrouter.ai/api/v1/models/typesafe/jev-1.13/endpoints",
    { signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw Error("Jev model metadata unavailable");
  const metadata = await response.json();
  save("model-metadata.json", metadata);
  const provider = metadata.data?.endpoints?.find(
    (e) => e.provider_name === "TypeSafe",
  );
  if (
    !provider ||
    Number(provider.pricing.prompt) !== 0.000000042 ||
    Number(provider.pricing.completion) !== 0 ||
    provider.context_length > 64000
  )
    throw Error("Jev price or limits changed. Stop before spending.");
  const protocol = {
    createdAt: new Date().toISOString(),
    authorization:
      "User authorized Jev asset-ranking pilot and explicitly requested the existing OpenRouter testing key.",
    model,
    endpoint: "https://openrouter.ai/api/alpha/decisions",
    manifestHash,
    cases: cases.length,
    calls: cases.length * 2,
    ceilingUsd: ceilingNanoUsd / 1e9,
    perCallReservationUsd: reservationNanoUsd / 1e9,
    totalWorstCaseReservationUsd: (cases.length * 2 * reservationNanoUsd) / 1e9,
    labelSource:
      "Assistant-authored synthetic fixtures, frozen before responses. Not human-labeled or representative Marketplace data.",
    baseline:
      "First candidate in fixture order, not a real Marketplace benchmark.",
    gate: "Exploratory only. At least 14/16 correct and all none-fit/adversarial cases correct before considering a separate real-data evaluation. Passing does not authorize production integration.",
    retryPolicy:
      "No automatic retry. Stop on first failed call or unreconciled cost.",
    keyBefore: before,
  };
  save("protocol.json", protocol);
  save("fixtures.json", cases);
  const reportText = (report, after) =>
    `# Jev asset-ranking pilot\n\n${report ? `${report.summary.completed} of 16 calls completed. ${report.summary.correct} correct selections.` : "Not started."}\n\nSynthetic smoke test with assistant-authored labels. No real Marketplace quality or gameplay claim.\n\nModel: ${model}. Ceiling: $0.05. No retries.\n\n${report ? `Provider-reported cost: $${report.summary.providerReportedUsd.toFixed(9)}. Unreconciled reservation: $${(report.summary.unreconciledReservationNanoUsd / 1e9).toFixed(9)}.` : ""}\n\nBefore balance: $${before.remaining.toFixed(9)} at ${before.at}. ${after ? `After balance: $${after.remaining.toFixed(9)} at ${after.at}.` : "After balance not yet read."}\n\nSee ledger.json for every call, timestamps, reservation, returned model, scores and usage.\n`;
  fs.writeFileSync(path.join(directory, "RESULTS.md"), reportText());
  const report = await runPilot({
    key,
    directory,
    onProgress: (r) =>
      fs.writeFileSync(path.join(directory, "RESULTS.md"), reportText(r)),
  });
  let after;
  try {
    after = await balance();
    save("key-after.json", after);
  } catch {
    save("balance-unavailable.json", {
      at: new Date().toISOString(),
      reason: "Final key read failed. No inference retried.",
    });
  }
  if (after)
    save("balance-reconciliation.json", {
      before: before.remaining,
      after: after.remaining,
      difference: before.remaining - after.remaining,
      reportedCost: report.summary.providerReportedUsd,
      differenceMinusReportedCost:
        before.remaining - after.remaining - report.summary.providerReportedUsd,
      at: after.at,
    });
  fs.writeFileSync(
    path.join(directory, "RESULTS.md"),
    reportText(report, after),
  );
  console.log(JSON.stringify({ summary: report.summary, after }));
} catch (error) {
  // Only application-authored messages reach this output. Never expose child-process output.
  const message =
    error instanceof Error &&
    /^(This pilot|Could not|Key allowance|Insufficient|Jev |Unexpected)/.test(
      error.message,
    )
      ? error.message
      : "Pilot stopped before completion. Details suppressed.";
  save("runner-failure.json", { at: new Date().toISOString(), message });
  console.log(message);
  process.exitCode = 1;
} finally {
  key = "";
}
