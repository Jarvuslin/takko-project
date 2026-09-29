// User-authorized live evaluation. Commands are local files, one at a time.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { _electron, expect } from "@playwright/test";
import { Configuration } from "../src/generation/settings";
import { windowsCredentialVault } from "../src/generation/credential-vault";

const output = path.resolve("docs/results/fighting-live");
const control = path.resolve(".forge/fighting-control");
const profile = path.resolve(".forge/fighting-live-profile");
for (const folder of [output, control, profile])
  fs.mkdirSync(folder, { recursive: true });
const source = path.join(process.env.APPDATA!, "Forge Desktop");
const publicSettings = await (
  await fetch("http://127.0.0.1:57200/api/models")
).json();
if (
  publicSettings.budgetMicros !== 5_000_000 ||
  publicSettings.generationBudgetMicros !== 5_000_000
)
  throw Error("Review changed spending limits before this run");
const config = new Configuration(path.join(profile, "projects/configuration"));
config.save({
  profiles: publicSettings.profiles.map(({ hasKey, ...model }: any) => model),
  routes: publicSettings.routes,
  budgetMicros: 4_400_000,
  generationBudgetMicros: 4_400_000,
  repairLimit: publicSettings.repairLimit,
  presets: publicSettings.presets,
  activePresetId: publicSettings.activePresetId,
});
fs.copyFileSync(
  path.join(source, "provider-keys.dpapi"),
  path.join(profile, "provider-keys.dpapi"),
);
async function balance() {
  const keys = windowsCredentialVault(
    path.join(profile, "provider-keys.dpapi"),
  )!.read();
  const key = keys["openrouter|https://openrouter.ai/api/v1"];
  if (!key) return { at: new Date().toISOString(), unavailable: true };
  const response = await fetch("https://openrouter.ai/api/v1/key", {
    headers: { Authorization: "Bearer " + key },
  });
  if (!response.ok)
    return {
      at: new Date().toISOString(),
      unavailable: true,
      status: response.status,
    };
  const { data } = await response.json();
  return {
    at: new Date().toISOString(),
    limit: data.limit,
    remaining: data.limit_remaining,
    usage: data.usage,
  };
}
const initialBalance = await balance();
if (!fs.existsSync(path.join(output, "balance-before.json")))
  fs.writeFileSync(
    path.join(output, "balance-before.json"),
    JSON.stringify(initialBalance, null, 2),
  );
const electron = createRequire(import.meta.url)("electron") as string;
const target = path.resolve(process.argv[2] ?? "dist-desktop");
const packaged = target.toLowerCase().endsWith(".exe");
const app = await _electron.launch({
  executablePath: packaged ? target : electron,
  args: [...(packaged ? [] : [target]), "--user-data-dir=" + profile],
  timeout: 30000,
});
const page = await app.firstWindow();
await page.waitForURL("http://127.0.0.1:*/");
const origin = new URL(page.url()).origin;
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message));
const runtime = {
  origin,
  pid: process.pid,
  profile,
  output,
  budgetMicros: 4_400_000,
  initialBalance,
};
fs.writeFileSync(
  path.join(control, "runtime.json"),
  JSON.stringify(runtime, null, 2),
);
console.log(JSON.stringify(runtime));
const api = async (route: string, method = "GET", body?: unknown) => {
  const response = await page.request.fetch(origin + "/api" + route, {
    method,
    data: body,
  });
  const data = await response.json();
  if (!response.ok())
    throw Error(`${response.status()} ${JSON.stringify(data)}`);
  return data;
};
const ledger = async () => {
  const summaries = await api("/projects");
  const projects = [];
  for (const summary of summaries) {
    const project = await api("/projects/" + summary.id);
    projects.push(project);
    fs.writeFileSync(
      path.join(output, project.id + ".json"),
      JSON.stringify(project, null, 2),
    );
  }
  const charges = projects.flatMap((project) =>
    project.charges.map((charge: unknown) => ({
      projectId: project.id,
      ...(charge as object),
    })),
  );
  const spent = charges.reduce(
    (total: number, charge: any) => total + charge.chargedMicros,
    0,
  );
  const reserved = projects.reduce(
    (total, project) => total + project.reservedMicros,
    0,
  );
  const record = {
    at: new Date().toISOString(),
    authorizedBudgetMicros: 4_400_000,
    paidCalls: charges.length,
    spentMicros: spent,
    reservedMicros: reserved,
    charges,
    rendererErrors: errors,
  };
  fs.writeFileSync(
    path.join(output, "ledger.json"),
    JSON.stringify(record, null, 2),
  );
  if (spent + reserved > 4_400_000) throw Error("Evaluation budget exceeded");
  return record;
};
let stopped = false;
const stop = () => {
  stopped = true;
};
const execute = Object.getPrototypeOf(async function () {}).constructor;
try {
  while (!stopped) {
    for (const file of fs
      .readdirSync(control)
      .filter((name) => /^\d+\.js$/.test(name))
      .sort()) {
      const resultPath = path.join(control, file + ".result.json");
      if (fs.existsSync(resultPath)) continue;
      try {
        const value = await new execute(
          "page",
          "app",
          "origin",
          "api",
          "fs",
          "path",
          "output",
          "expect",
          "ledger",
          "stop",
          fs.readFileSync(path.join(control, file), "utf8"),
        )(page, app, origin, api, fs, path, output, expect, ledger, stop);
        await ledger();
        fs.writeFileSync(
          resultPath,
          JSON.stringify({ ok: true, value }, null, 2),
        );
      } catch (error) {
        await ledger();
        fs.writeFileSync(
          resultPath,
          JSON.stringify({ ok: false, error: String(error) }, null, 2),
        );
      }
    }
    await ledger();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
} finally {
  await ledger();
  fs.writeFileSync(
    path.join(output, "balance-after.json"),
    JSON.stringify(await balance(), null, 2),
  );
  await app.close();
  fs.writeFileSync(
    path.join(output, "closed.json"),
    JSON.stringify({ at: new Date().toISOString(), origin, closed: true }),
  );
}
