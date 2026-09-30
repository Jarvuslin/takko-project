import { pickerFixture, pickerStudio } from "./asset-picking-fixture";
import { fakeTransport, fixtureReview, specification, profile } from "./generation-fixtures";
import type { Project } from "../src/generation/schema";
import type { AssetAdapter, AssetCandidate } from "../src/generation/asset-contract";
import { inspectPcmWav, type StudioAudioEvidence } from "../src/generation/audio-evidence";
import type { OpenCodeJob } from "../src/generation/opencode-runtime";

/** External provider and native adapter doubles. Engine, API, persistence and UI remain real. */
export async function chatJourneyFixture(directBuild = false) {
  const f = await pickerFixture();
  const engine = f.app.locals.engine;
  const original = engine.transport;
  const fallback = fakeTransport();
  const control = { buildDelay: 0, buildCalls: 0, contexts: [] as any[] };
  const settings = engine.config.read();
  const reviewer = { ...profile("openrouter"), model: "google/gemini-2.5-flash", baseUrl: "https://openrouter.ai/api/v1" };
  engine.config.save({ ...settings, profiles: [...settings.profiles, reviewer], routes: { ...settings.routes, reviewer: [reviewer.id] } });
  engine.config.connect(reviewer, "offline-fixture-key");
  engine.transport = async (url: any, init: any) => {
    const body = JSON.parse(String(init.body));
    if (!body.messages) return original(url, init);
    const raw = body.messages[1].content;
    const c = JSON.parse((typeof raw === "string" ? raw : raw.find((part: any) => part.type === "text").text).split(/\n(?:Your last response failed validation\.|Native Studio capture produced by)/)[0]);
    control.contexts.push(c);
    if (["proposal", "proposal-edit"].includes(c.kind)) return original(url, init);
    let output: any;
    if (c.kind === "scoped-plan") output = {
      tasks: c.spec.tasks.filter((t: any) => c.affectedTaskIds.includes(t.id)),
      requirements: c.spec.requirements.filter((r: any) => c.spec.tasks.some((t: any) => c.affectedTaskIds.includes(t.id) && t.requirements.includes(r.id))),
      visualDirection: c.proposal.theme.text,
    };
    else if (c.task === "asset-evaluation") output = { accepted: true, reason: "Offline native adapter fixture only", visualFit: true, functionalFit: true, audioFit: true };
    else if (c.coordination?.step === "area") {
      const proposal = c.approvedProposal ?? c.proposal ?? engine.store.list().find((p: Project) => p.scope === c.namespace)?.proposal;
      const base = specification(c.request, c.namespace);
      const needs = (proposal?.assetNeeds ?? []).filter((n: any) => !n.pick?.skip);
      const requirements = ["mechanics", "theme", "environment"].map(section => ({ ...base.requirements[0], id: "core_" + section, sourceId: "proposal:" + section, sourceQuote: "", description: section }));
      for (const n of needs) requirements.push({ ...base.requirements[0], id: "core_" + n.requirementId, sourceId: "proposal:mechanics", sourceQuote: "", description: n.role });
      output = { requirements, tasks: [{ ...base.tasks[0], id: "core_build", requirements: requirements.map(r => r.id), proposalSections: ["mechanics", "theme", "environment", "assets"] }],
        assetNeeds: needs.map(({ pick: _pick, ...n }: any) => ({ ...n, id: "core_" + n.id, requirementId: "core_" + n.requirementId, intent: { ...n.intent, relatedRequirementIds: ["core_" + n.requirementId] } })), referenceDecisions: [] };
    } else if (c.task && typeof c.task === "object") {
      control.buildCalls++;
      if (control.buildDelay) await new Promise(resolve => setTimeout(resolve, control.buildDelay));
      if (init.signal?.aborted) throw Error("Stopped offline builder");
      const owned = c.task.files.length ? c.task.files : [`ServerScriptService/${c.namespace}/Game.server.luau`];
      output = { files: owned.map((path: string) => ({ path, kind: "Script", source: 'local value = Instance.new("IntValue")\nvalue.Name = "OfflineFixture"\nvalue.Parent = script.Parent' })), scene: [], assets: [],
        coverage: c.task.requirements.map((requirementId: string) => ({ requirementId, status: "implemented", detail: "Offline fixture implementation", files: owned })) };
    } else if (/PHASE: reviewer/.test(body.messages[0].content)) output = { issues: [], tests: c.spec.requirements.map((r: any) => ({ ...fixtureReview.tests[0], id: r.id + "Test", requirementId: r.id })) };
    else return fallback(url, init);
    return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(output) } }], usage: { prompt_tokens: 100, completion_tokens: 100, cost: 0 } });
  };
  if (directBuild) engine.executionPolicy.opencode = {
    preflight() {},
    async run(job: OpenCodeJob) {
      const context = job.tools.find(t => t.name === "task_context")!;
      const submit = job.tools.find(t => t.name === "submit_task")!;
      for (const task of job.project.spec!.tasks) {
        if (job.project.completedBuildTasks?.includes(task.id)) continue;
        const produced = await context.execute(context.schema.parse({ taskId: task.id }));
        const response = await engine.transport("http://offline.invalid", { signal: job.signal, body: JSON.stringify({ messages: [{ content: "PHASE: builder" }, { content: JSON.stringify(produced) }] }) });
        const payload = await response.json();
        await submit.execute(submit.schema.parse({ taskId: task.id, patch: JSON.parse(payload.choices[0].message.content) }), job.signal);
      }
    },
  };
  const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
  let capture = 0;
  const audio = (candidate: AssetCandidate): StudioAudioEvidence => {
    const rate = 16000, bytes = Buffer.alloc(44 + rate * 2);
    bytes.write("RIFF"); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write("WAVEfmt ", 8); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write("data", 36); bytes.writeUInt32LE(rate * 2, 40);
    for (let i = 4800; i < rate; i++) bytes.writeInt16LE(Math.round(Math.sin(i * 0.14) * 8000), 44 + i * 2);
    const wav = inspectPcmWav(bytes);
    return { dataUrl: "data:audio/wav;base64," + bytes.toString("base64"), sha256: wav.sha256, durationMs: wav.durationMs, sampleRate: wav.sampleRate, channels: wav.channels, rms: wav.rms, peak: wav.peak,
      source: { kind: "studio_process_loopback", mode: "include_process_tree", studioId: pickerStudio, candidateId: candidate.id, token: "mock-" + candidate.id, processId: 1234, processStartedAt: "2026-09-29T00:00:00Z", capturedAt: new Date(Date.UTC(2026, 8, 29, 1, 0, ++capture)).toISOString(), file: "synthetic-offline.wav" } };
  };
  engine.assetAdapterFactory = async (p: Project) => {
    const receipt = (operation: string) => ({ operation, at: new Date().toISOString(), studioId: pickerStudio, data: { mocked: true } });
    const functional = { contentLoaded: true, instanceCount: 1, scriptCount: 0, playbackObserved: true };
    const adapter: AssetAdapter = {
      identity: "offline-desktop-journey-adapter",
      search: async () => ({ candidates: [], receipts: [receipt("search")] }),
      inspect: async (_need, candidate) => ({ candidate, token: "mock-" + candidate.id, path: `Workspace/${p.scope}/Assets/${candidate.id}`, safe: true, reasons: [], snapshot: { mocked: true }, image, ...(candidate.kind === "Audio" ? { audio: audio(candidate) } : {}), receipts: [receipt("inspect")], functional }),
      place: async (need, inspection) => ({ passed: true, reasons: [], snapshot: { mocked: true }, image: image.replace("CAAAAC0", "CAAAAD0"), ...(inspection.candidate.kind === "Audio" ? { audio: audio(inspection.candidate) } : {}), receipts: [receipt("place")], functional,
        bundle: { files: [], coverage: [], assets: [], scene: [{ path: `Workspace/${p.scope}/Assets/${need.id}`, className: "Part", properties: { Anchored: true } }] } }),
      discard: async () => [receipt("discard")],
    };
    return { adapter, close: async () => {} };
  };
  return { ...f, control };
}

export async function chooseJourneyAssets(f: Awaited<ReturnType<typeof chatJourneyFixture>>, skipSound = false) {
  await f.search(); await f.choose();
  await f.search("punchAnimation", "punch animation"); await f.choose(f.animation.assetId, "punchAnimation");
  const p = f.project(), g = p.assetDiscovery!.groups.find(g => g.id === "punchAnimation")!;
  const entry = g.options.find(o => o.assetId === f.animation.assetId)!.previewData!.pack!.entries.find(e => e.clip)!;
  await f.command("asset-picks/clip", { groupId: g.id, assetId: f.animation.assetId, clipKey: entry.key });
  if (skipSound) await f.command("asset-picks/skip", { groupId: "hitSound" });
  else { await f.search("hitSound", "hit sound"); await f.choose(f.sound.assetId, "hitSound"); }
  return f.project();
}
