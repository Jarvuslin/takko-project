import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Project } from "./schema";
export function newProject(request: string, budgetMicros: number): Project {
  request = z.string().trim().min(5).max(12000).parse(request);
  const id = randomUUID();
  return {
    schemaVersion: 2,
    id,
    name: request.slice(0, 64),
    request,
    revision: 1,
    scope: "Forge_" + id.replaceAll("-", "").slice(0, 12),
    spec: null,
    answers: {},
    approvedRevision: null,
    stage: "draft",
    artifact: null,
    review: null,
    checks: [],
    charges: [],
    budgetMicros,
    reservedMicros: 0,
    events: [],
    jobId: null,
    error: null,
    createdAt: new Date().toISOString(),
    studioEvidence: null,
  };
}
export class GenerationStore {
  checkpoint(p: Project) {
    const folder = path.join(this.directory, "history");
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(
      path.join(folder, z.uuid().parse(p.id) + "-" + randomUUID() + ".json"),
      JSON.stringify(p, null, 2),
    );
  }
  trace(id: string, event: unknown) {
    const folder = path.join(this.directory, "traces");
    fs.mkdirSync(folder, { recursive: true });
    fs.appendFileSync(
      path.join(folder, z.uuid().parse(id) + ".events.jsonl"),
      JSON.stringify(event) + "\n",
    );
    fs.writeFileSync(
      path.join(folder, z.uuid().parse(id) + ".json"),
      JSON.stringify(event, null, 2),
    );
  }
  constructor(readonly directory: string) {
    fs.mkdirSync(directory, { recursive: true });
  }
  private file(id: string) {
    return path.join(this.directory, z.uuid().parse(id) + ".json");
  }
  save(p: Project) {
    const file = this.file(p.id);
    fs.writeFileSync(file + ".tmp", JSON.stringify(p, null, 2));
    fs.renameSync(file + ".tmp", file);
    return p;
  }
  get(id: string): Project {
    const file = this.file(id);
    if (!fs.existsSync(file)) throw Error("Project not found");
    const p = JSON.parse(fs.readFileSync(file, "utf8"));
    if (p.schemaVersion === 2) return p;
    // Preserve the rejected template project intact before migrating its request.
    if (!fs.existsSync(file + ".legacy"))
      fs.copyFileSync(file, file + ".legacy");
    const next = newProject(String(p.request ?? ""), 2_000_000);
    next.id = id;
    next.legacyImport = true;
    next.events.push({
      at: new Date().toISOString(),
      message:
        "Imported the original request. The old template artifact is retained in a legacy backup.",
    });
    return this.save(next);
  }
  list() {
    return fs
      .readdirSync(this.directory)
      .filter((f) => /^[0-9a-f-]{36}\.json$/i.test(f))
      .map((f) => this.get(f.slice(0, -5)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  recover() {
    for (const p of this.list())
      if (p.jobId) {
        if (p.assetPipeline?.status === "running") {
          p.assetPipeline.status = "interrupted";
          p.assetPipeline.requiresReconciliation = true;
          p.assetPipeline.error =
            "Server restarted during asset execution. Retained receipts are diagnostic; uncertain tool effects require reconciliation before retry.";
          p.assetPipeline.finishedAt = new Date().toISOString();
        }
        if (p.reservedMicros)
          p.charges.push({
            phase: "repair",
            profileId: "interrupted",
            model: "unknown",
            reservedMicros: p.reservedMicros,
            chargedMicros: p.reservedMicros,
            estimated: true,
            inputTokens: null,
            outputTokens: null,
            status: "error",
            at: new Date().toISOString(),
          });
        p.reservedMicros = 0;
        p.jobId = null;
        p.stage = "interrupted";
        p.error =
          "The server restarted during generation. Any unresolved reservation remains charged conservatively.";
        this.save(p);
      }
  }
}
