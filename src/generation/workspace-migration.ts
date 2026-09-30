import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { settingsSchema, type Settings } from "./schema";
import type { CredentialVault } from "./credential-vault";

type Source = { name: string; directory: string };
type VaultFactory = (file: string) => CredentialVault | undefined;

function files(directory: string, prefix = ""): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw Error("Migration refuses linked workspace files.");
    const relative = path.join(prefix, entry.name);
    return entry.isDirectory()
      ? files(path.join(directory, entry.name), relative)
      : [relative];
  }).sort();
}

/** Fingerprints only migration inputs, to refuse a stale cutover after live edits. */
export function workspaceFingerprint(directory: string): string {
  const hash = createHash("sha256");
  for (const file of [...files(path.join(directory, "projects")).map(f => path.join("projects", f)), "provider-keys.dpapi"]) {
    hash.update(file);
    const full = path.join(directory, file);
    hash.update(fs.existsSync(full) ? fs.readFileSync(full) : "<absent>");
  }
  return hash.digest("hex");
}

function mergeSettings(active: Settings, additional: Settings): Settings {
  const next = structuredClone(active);
  const ids = new Map<string, string>();
  for (const profile of additional.profiles) {
    const previous = next.profiles.find(p => p.id === profile.id);
    const id = previous && JSON.stringify(previous) !== JSON.stringify(profile) ? randomUUID() : profile.id;
    ids.set(profile.id, id);
    if (!previous || id !== profile.id) next.profiles.push({ ...profile, id });
  }
  next.presets ??= [];
  for (const preset of additional.presets ?? []) {
    const routes = Object.fromEntries(Object.entries(preset.routes).map(([phase, profiles]) => [phase, profiles?.map(id => ids.get(id) ?? id)])) as Settings["routes"];
    const candidate = { ...preset, routes };
    const previous = next.presets.find(p => p.id === candidate.id);
    if (previous && JSON.stringify(previous) === JSON.stringify(candidate)) continue;
    if (previous) candidate.id = randomUUID();
    next.presets.push(candidate);
  }
  return settingsSchema.parse(next);
}

/** Active source comes first. No source is written, no app is launched or stopped. */
export function stageWorkspace(sources: Source[], target: string, vaultFactory: VaultFactory) {
  if (!sources.length) throw Error("At least one workspace is required.");
  target = path.resolve(target);
  if (fs.existsSync(target)) throw Error("Migration target must be new.");
  for (const source of sources) {
    const root = path.resolve(source.directory);
    if (!/^[a-z0-9-]+$/.test(source.name)) throw Error("Invalid migration source name.");
    if (target === root || target.startsWith(root + path.sep) || root.startsWith(target + path.sep)) throw Error("Migration target overlaps a source.");
    if (!fs.existsSync(path.join(root, "projects", "configuration", "models.json"))) throw Error("Source settings are missing.");
  }
  const snapshots = sources.map(s => ({ ...s, directory: path.resolve(s.directory), fingerprint: workspaceFingerprint(s.directory) }));
  let settings: Settings | undefined;
  const keys: Record<string, string> = {};
  const conflicts: { source: string; file: string; retained: "earlier-source" }[] = [];
  let keyConflicts = 0;
  fs.mkdirSync(target, { recursive: true });
  for (const source of sources) {
    const incoming = settingsSchema.parse(JSON.parse(fs.readFileSync(path.join(source.directory, "projects", "configuration", "models.json"), "utf8")));
    settings = settings ? mergeSettings(settings, incoming) : incoming;
    for (const file of files(path.join(source.directory, "projects"))) {
      if (file === path.join("configuration", "models.json")) continue;
      const from = path.join(source.directory, "projects", file);
      const to = path.join(target, "projects", file);
      if (fs.existsSync(to)) {
        if (fs.readFileSync(to).equals(fs.readFileSync(from))) continue;
        // Cached inspection and app-level preferences/pairing use the active source.
        // Originals stay at their source, listed in the cutover receipt.
        if (!["asset-library", "configuration", "bridge"].includes(file.split(path.sep)[0]!)) throw Error(`Conflicting project/history file: ${file}`);
        conflicts.push({ source: source.name, file, retained: "earlier-source" });
        continue;
      }
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
    const vault = vaultFactory(path.join(source.directory, "provider-keys.dpapi"));
    if (!vault) throw Error("Encrypted vault migration is unavailable.");
    for (const [identity, secret] of Object.entries(vault.read())) {
      if (identity in keys) { if (keys[identity] !== secret) keyConflicts++; }
      else keys[identity] = secret;
    }
  }
  const configuration = path.join(target, "projects", "configuration");
  fs.mkdirSync(configuration, { recursive: true });
  fs.writeFileSync(path.join(configuration, "models.json"), JSON.stringify(settings, null, 2));
  const stagedVault = vaultFactory(path.join(target, "provider-keys.dpapi"));
  if (!stagedVault) throw Error("Encrypted vault migration is unavailable.");
  stagedVault.write(keys);
  const reopened = vaultFactory(path.join(target, "provider-keys.dpapi"))!.read();
  if (Object.keys(keys).length !== Object.keys(reopened).length || Object.entries(keys).some(([id, key]) => reopened[id] !== key)) throw Error("Staged encrypted vault failed reopen verification.");
  for (const source of snapshots) if (workspaceFingerprint(source.directory) !== source.fingerprint) throw Error("A source changed during staging. Cutover is not safe.");
  const projectIds = fs.readdirSync(path.join(target, "projects")).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5));
  const receipt = { createdAt: new Date().toISOString(), sources: snapshots, target, projectIds, conflicts, keyCount: Object.keys(keys).length, keyConflicts, vaultReopened: true, stagedFingerprint: workspaceFingerprint(target) };
  fs.writeFileSync(path.join(target, "migration-receipt.json"), JSON.stringify(receipt, null, 2));
  return receipt;
}

export function verifyStagedWorkspace(target: string) {
  const receipt = JSON.parse(fs.readFileSync(path.join(target, "migration-receipt.json"), "utf8"));
  for (const source of receipt.sources) if (workspaceFingerprint(source.directory) !== source.fingerprint) throw Error("A source changed since staging. Restage before cutover.");
  if (workspaceFingerprint(target) !== receipt.stagedFingerprint) throw Error("The staged workspace changed. Restage before cutover.");
}
