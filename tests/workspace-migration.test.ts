import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { Configuration } from "../src/generation/settings";
import { windowsCredentialVault, type CredentialVault } from "../src/generation/credential-vault";
import { stageWorkspace, verifyStagedWorkspace } from "../src/generation/workspace-migration";
import { profile } from "./generation-fixtures";

const dirs: string[] = [];
const root = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "takko-migration-")); dirs.push(d); return d; };
afterEach(() => { for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true }); });
const emptyVault = (): CredentialVault => ({ read: () => ({}), write: () => {} });
function source(parent: string, name: string) {
  const directory = path.join(parent, name);
  const config = new Configuration(path.join(directory, "projects", "configuration"));
  config.save(config.read());
  return { name, directory };
}
function put(directory: string, file: string, value: string) {
  const full = path.join(directory, "projects", file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value);
}
it("preserves projects and evidence, remaps preset collisions and rejects stale cutovers", () => {
  const base = root(), active = source(base, "active"), old = source(base, "old"), target = path.join(base, "staged");
  const oldConfig = new Configuration(path.join(old.directory, "projects", "configuration"));
  const settings = oldConfig.read();
  settings.presets![0]!.name = "Older preset";
  oldConfig.save(settings);
  put(active.directory, "a.json", '{"id":"a","stage":"failed"}');
  put(old.directory, "b.json", '{"id":"b","stage":"failed"}');
  put(old.directory, "traces/b/result.json", '{"failure":"preserved"}');
  put(active.directory, "asset-library/123.json", "active inspection");
  put(old.directory, "asset-library/123.json", "old inspection");
  const receipt = stageWorkspace([active, old], target, emptyVault);
  expect(receipt.projectIds).toEqual(["a", "b"]);
  expect(receipt.conflicts).toHaveLength(1);
  expect(fs.readFileSync(path.join(target, "projects/traces/b/result.json"), "utf8")).toBe('{"failure":"preserved"}');
  expect(fs.readFileSync(path.join(target, "projects/asset-library/123.json"), "utf8")).toBe("active inspection");
  const merged = new Configuration(path.join(target, "projects/configuration")).read();
  expect(merged.presets).toHaveLength(2);
  expect(new Set(merged.presets!.map(p => p.id)).size).toBe(2);
  expect(merged.activePresetId).toBe(new Configuration(path.join(active.directory, "projects/configuration")).read().activePresetId);
  verifyStagedWorkspace(target);
  put(active.directory, "a.json", "changed after staging");
  expect(() => verifyStagedWorkspace(target)).toThrow("source changed");
});
it("refuses conflicting projects, existing targets and source overlap", () => {
  const base = root(), a = source(base, "active"), b = source(base, "old");
  put(a.directory, "same.json", "first"); put(b.directory, "same.json", "second");
  expect(() => stageWorkspace([a, b], path.join(base, "stage"), emptyVault)).toThrow("Conflicting project");
  expect(fs.existsSync(path.join(base, "stage/migration-receipt.json"))).toBe(false);
  expect(() => stageWorkspace([a], a.directory, emptyVault)).toThrow("target must be new");
  expect(() => stageWorkspace([a], path.join(a.directory, "stage"), emptyVault)).toThrow("overlaps");
});
it.skipIf(process.platform !== "win32")("merges DPAPI connections and reopens through the real Configuration without plaintext disk copies", () => {
  const base = root(), a = source(base, "active"), b = source(base, "old"), target = path.join(base, "stage");
  const p = { ...profile(), provider: "openrouter" as const, baseUrl: "https://openrouter.ai/api/v1" };
  const config = new Configuration(path.join(a.directory, "projects/configuration"), windowsCredentialVault(path.join(a.directory, "provider-keys.dpapi")));
  config.connect(p, "synthetic-active-secret"); config.save({ ...config.read(), profiles: [p] });
  const old = new Configuration(path.join(b.directory, "projects/configuration"), windowsCredentialVault(path.join(b.directory, "provider-keys.dpapi")));
  old.connect(p, "synthetic-old-secret"); old.save({ ...old.read(), profiles: [{ ...p, name: "Older model name" }] });
  const receipt = stageWorkspace([a, b], target, windowsCredentialVault);
  expect(receipt.keyConflicts).toBe(1);
  expect(receipt.keyCount).toBe(1);
  const reopened = new Configuration(path.join(target, "projects/configuration"), windowsCredentialVault(path.join(target, "provider-keys.dpapi")));
  expect(reopened.key(p.id)).toBe("synthetic-active-secret");
  expect(reopened.read().profiles).toHaveLength(2);
  expect(old.key(p.id)).toBe("synthetic-old-secret");
  expect(fs.readFileSync(path.join(target, "provider-keys.dpapi"), "utf8")).not.toContain("synthetic-");
  expect(fs.readFileSync(path.join(target, "migration-receipt.json"), "utf8")).not.toContain("synthetic-");
  verifyStagedWorkspace(target);
}, 30000);
