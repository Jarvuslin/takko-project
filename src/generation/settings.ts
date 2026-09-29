import { RequestError, StoredDataError } from "../errors";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { settingsSchema, type Settings, type Profile } from "./schema";
import type { CredentialVault } from "./credential-vault";
import { isDecisionModel, validateDecisionProfile } from "./decisions";
export const providerIdentity = (p: Pick<Profile, "provider" | "baseUrl">) =>
  p.provider + "|" + new URL(p.baseUrl).href.replace(/\/$/, "");
export const endpoints = {
  openrouter: "https://openrouter.ai/api/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  compatible: "http://127.0.0.1:1234/v1",
};
export function withPresetLibrary(settings: Settings): Settings {
  if (settings.presets !== undefined) return settings;
  const {
    profiles: _profiles,
    presets: _presets,
    activePresetId: _active,
    ...options
  } = settings;
  const preset = {
    ...options,
    id: "00000000-0000-4000-8000-000000000001",
    name: "My first preset",
    icon: "taco" as const,
  };
  return { ...settings, presets: [preset], activePresetId: preset.id };
}
export function validateProviderEndpoint(p: Profile) {
  const u = new URL(p.baseUrl);
  if (u.username || u.password || u.search || u.hash)
    throw new RequestError(
      "Provider URL cannot contain credentials, query parameters or fragments",
    );
  if (
    u.protocol !== "https:" &&
    !(u.protocol === "http:" && ["127.0.0.1", "localhost"].includes(u.hostname))
  )
    throw new RequestError("Use HTTPS or a local provider");
  if (
    p.provider !== "compatible" &&
    p.baseUrl.replace(/\/$/, "") !== endpoints[p.provider]
  )
    throw new RequestError(
      "Use the official endpoint or explicitly select a compatible provider",
    );
}
export class Configuration {
  private keys = new Map<string, string>();
  private providerKeys: Record<string, string>;
  private validated = new Set<string>();
  private file: string;
  constructor(
    directory: string,
    private vault?: CredentialVault,
  ) {
    fs.mkdirSync(directory, { recursive: true });
    this.file = path.join(directory, "models.json");
    this.providerKeys = vault?.read() ?? {};
  }
  providerKey(p: Profile) {
    return this.providerKeys[providerIdentity(p)] ?? "";
  }
  isValidated(p: Profile) {
    return this.validated.has(providerIdentity(p));
  }
  connect(p: Profile, key: string) {
    validateProviderEndpoint(p);
    const identity = providerIdentity(p);
    const next = { ...this.providerKeys, [identity]: key };
    this.vault?.write(next);
    this.providerKeys = next;
    this.validated.add(identity);
  }
  invalidate(p: Profile) {
    this.validated.delete(providerIdentity(p));
  }
  disconnect(p: Profile) {
    const next = { ...this.providerKeys };
    delete next[providerIdentity(p)];
    this.vault?.write(next);
    this.providerKeys = next;
    this.invalidate(p);
    for (const model of this.read().profiles)
      if (providerIdentity(model) === providerIdentity(p))
        this.keys.delete(model.id);
  }
  read(): Settings {
    try {
      return withPresetLibrary(
        fs.existsSync(this.file)
          ? settingsSchema.parse(JSON.parse(fs.readFileSync(this.file, "utf8")))
          : {
              profiles: [],
              routes: { planner: [], builder: [], reviewer: [], repair: [] },
              budgetMicros: 2_000_000,
              repairLimit: 2,
            },
      );
    } catch (cause) {
      throw new StoredDataError("model configuration", { cause });
    }
  }
  public() {
    const s = this.read();
    return {
      ...s,
      credentialStorage: this.vault ? "windows-encrypted" : "session",
      connections: Object.keys(this.providerKeys).map((identity) => {
        const separator = identity.indexOf("|");
        const provider = identity.slice(0, separator),
          baseUrl = identity.slice(separator + 1);
        return {
          provider,
          baseUrl,
          hasKey: true,
          validated: this.validated.has(identity),
        };
      }),
      profiles: s.profiles.map((p) => ({
        ...p,
        hasKey: !!(this.providerKey(p) || this.keys.get(p.id)),
      })),
    };
  }
  save(input: unknown) {
    const s = withPresetLibrary(settingsSchema.parse(input));
    // Legacy callers and environment setup still edit the active settings.
    // Keep that preset's snapshot consistent with what the engine will use.
    s.presets = s.presets?.map((p) =>
      p.id === s.activePresetId
        ? {
            ...p,
            routes: s.routes,
            budgetMicros: s.budgetMicros,
            generationBudgetMicros: s.generationBudgetMicros,
            reservationBudgetMicros: s.reservationBudgetMicros,
            repairLimit: s.repairLimit,
            researchEnabled: s.researchEnabled,
          }
        : p,
    );
    const ids = new Set(s.profiles.map((p) => p.id));
    if (ids.size !== s.profiles.length)
      throw new RequestError("Duplicate model profile");
    const presetIds = new Set((s.presets ?? []).map((p) => p.id));
    if (presetIds.size !== s.presets?.length)
      throw new RequestError("Duplicate preset");
    if (s.activePresetId && !presetIds.has(s.activePresetId))
      throw new RequestError("Active preset is missing");
    for (const preset of s.presets ?? [])
      for (const route of Object.values(preset.routes))
        for (const id of route ?? [])
          if (!ids.has(id))
            throw new RequestError(
              "Preset references an unknown model profile",
            );
    for (const route of Object.values(s.routes))
      if (route)
        for (const id of route)
          if (!ids.has(id))
            throw new RequestError("Route references an unknown model profile");
    for (const p of s.profiles) {
      validateProviderEndpoint(p);
      const previous = this.read().profiles.find((x) => x.id === p.id);
      if (
        previous &&
        (previous.provider !== p.provider || previous.baseUrl !== p.baseUrl)
      )
        this.keys.delete(p.id);
    }
    for (const routes of [
      s.routes,
      ...(s.presets ?? []).map((p) => p.routes),
    ]) {
      for (const [role, route] of Object.entries(routes)) {
        for (const id of route ?? []) {
          const profile = s.profiles.find((p) => p.id === id)!;
          if (role === "decisions") validateDecisionProfile(profile);
          else if (isDecisionModel(profile.model))
            throw new RequestError(
              "Jev is a non-coding decision model. Assign it only to Non-coding decisions.",
            );
        }
      }
    }
    for (const id of this.keys.keys()) if (!ids.has(id)) this.keys.delete(id);
    fs.writeFileSync(this.file + ".tmp", JSON.stringify(s, null, 2));
    fs.renameSync(this.file + ".tmp", this.file);
    return this.public();
  }
  setKey(id: string, key: string) {
    if (!this.read().profiles.some((p) => p.id === id))
      throw new RequestError("Unknown model profile");
    if (typeof key !== "string" || key.length > 1000)
      throw new RequestError("Invalid API key");
    if (key.trim()) this.keys.set(id, key.trim());
    else this.keys.delete(id);
  }
  key(id: string) {
    return this.providerKey(this.profile(id)) || this.keys.get(id) || "";
  }
  copyKey(sourceId: string, targetId: string) {
    const source = this.profile(sourceId),
      target = this.profile(targetId);
    if (
      source.provider !== target.provider ||
      source.baseUrl !== target.baseUrl
    )
      throw new RequestError(
        "Keys can only be reused for the same provider and endpoint.",
      );
    if (!this.key(sourceId))
      throw new RequestError("The source profile has no session key.");
    this.setKey(targetId, this.key(sourceId));
  }
  importEnvironment(env: NodeJS.ProcessEnv) {
    for (const kind of [
      "openrouter",
      "openai",
      "anthropic",
      "gemini",
    ] as const) {
      const prefix = "FORGE_" + kind.toUpperCase();
      const key = env[prefix + "_API_KEY"];
      const model = env[prefix + "_MODEL"];
      if (!key || !model) continue;
      let s = this.read();
      let p = s.profiles.find((p) => p.provider === kind && p.model === model);
      if (!p) {
        if (
          env[prefix + "_INPUT_RATE"] === undefined ||
          env[prefix + "_OUTPUT_RATE"] === undefined
        )
          throw new RequestError(
            "Configure explicit input/output rates for " + kind,
          );
        p = {
          id: randomUUID(),
          name: kind,
          provider: kind,
          baseUrl: endpoints[kind],
          model,
          inputRate: Number(env[prefix + "_INPUT_RATE"]),
          outputRate: Number(env[prefix + "_OUTPUT_RATE"]),
          maxOutputTokens: 8192,
          jsonMode: true,
        };
        s.profiles.push(p);
        for (const phase of [
          "planner",
          "builder",
          "reviewer",
          "repair",
        ] as const)
          if (!s.routes[phase].length) s.routes[phase] = [p.id];
        this.save(s);
      }
      this.setKey(p.id, key);
    }
  }
  profile(id: string): Profile {
    const p = this.read().profiles.find((p) => p.id === id);
    if (!p) throw new RequestError("Unknown model profile");
    return p;
  }
}
