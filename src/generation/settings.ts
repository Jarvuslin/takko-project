import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { settingsSchema, type Settings, type Profile } from "./schema";
export const endpoints = {
  openrouter: "https://openrouter.ai/api/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  compatible: "http://127.0.0.1:1234/v1",
};
export class Configuration {
  private keys = new Map<string, string>();
  private file: string;
  constructor(directory: string) {
    fs.mkdirSync(directory, { recursive: true });
    this.file = path.join(directory, "models.json");
  }
  read(): Settings {
    return fs.existsSync(this.file)
      ? settingsSchema.parse(JSON.parse(fs.readFileSync(this.file, "utf8")))
      : {
          profiles: [],
          routes: { planner: [], builder: [], reviewer: [], repair: [] },
          budgetMicros: 2_000_000,
          repairLimit: 2,
        };
  }
  public() {
    const s = this.read();
    return {
      ...s,
      profiles: s.profiles.map((p) => ({
        ...p,
        hasKey: !!this.keys.get(p.id),
      })),
    };
  }
  save(input: unknown) {
    const s = settingsSchema.parse(input);
    const ids = new Set(s.profiles.map((p) => p.id));
    if (ids.size !== s.profiles.length) throw Error("Duplicate model profile");
    for (const route of Object.values(s.routes))
      if (route)
        for (const id of route)
          if (!ids.has(id))
            throw Error("Route references an unknown model profile");
    for (const p of s.profiles) {
      const u = new URL(p.baseUrl);
      if (u.username || u.password || u.search || u.hash)
        throw Error(
          "Provider URL cannot contain credentials, query parameters or fragments",
        );
      if (
        u.protocol !== "https:" &&
        !(
          u.protocol === "http:" &&
          ["127.0.0.1", "localhost"].includes(u.hostname)
        )
      )
        throw Error("Use HTTPS or a local provider");
      if (
        p.provider !== "compatible" &&
        p.baseUrl.replace(/\/$/, "") !== endpoints[p.provider]
      )
        throw Error(
          "Use the official endpoint or explicitly select a compatible provider",
        );
      const previous = this.read().profiles.find((x) => x.id === p.id);
      if (
        previous &&
        (previous.provider !== p.provider || previous.baseUrl !== p.baseUrl)
      )
        this.keys.delete(p.id);
    }
    for (const id of this.keys.keys()) if (!ids.has(id)) this.keys.delete(id);
    fs.writeFileSync(this.file + ".tmp", JSON.stringify(s, null, 2));
    fs.renameSync(this.file + ".tmp", this.file);
    return this.public();
  }
  setKey(id: string, key: string) {
    if (!this.read().profiles.some((p) => p.id === id))
      throw Error("Unknown model profile");
    if (typeof key !== "string" || key.length > 1000)
      throw Error("Invalid API key");
    if (key.trim()) this.keys.set(id, key.trim());
    else this.keys.delete(id);
  }
  key(id: string) {
    return this.keys.get(id) ?? "";
  }
  copyKey(sourceId: string, targetId: string) {
    const source = this.profile(sourceId),
      target = this.profile(targetId);
    if (
      source.provider !== target.provider ||
      source.baseUrl !== target.baseUrl
    )
      throw Error(
        "Keys can only be reused for the same provider and endpoint.",
      );
    if (!this.key(sourceId))
      throw Error("The source profile has no session key.");
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
          throw Error("Configure explicit input/output rates for " + kind);
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
    if (!p) throw Error("Unknown model profile");
    return p;
  }
}
