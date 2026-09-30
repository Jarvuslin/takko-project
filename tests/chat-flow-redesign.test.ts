import { afterEach, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { pickerFixture, pickerStudio } from "./asset-picking-fixture";
import { pickStatus } from "../src/marketplace/pick-status";
import { snapshotSchema } from "../src/marketplace/types";
import fs from "node:fs";
import { migrateAssetNeeds, stepRetry } from "../src/generation/retry";
import { coordinationInputHash } from "../src/generation/coordinator";
import { proposalQuestions } from "../src/generation/proposal-questions";
import { optionAnswer } from "../src/generation/questions";
import type { Project } from "../src/generation/schema";
import { refreshProposal } from "../src/generation/proposal";

const fixtures: Awaited<ReturnType<typeof pickerFixture>>[] = [];
async function fixture() { const f = await pickerFixture(); fixtures.push(f); return f; }
afterEach(async () => { for (const f of fixtures.splice(0)) await f.close(); });

it("stores an inspected selection on its proposal need", async () => {
  const f = await fixture();
  await f.search();
  const { data: p } = await f.choose();
  const need = p.proposal.assetNeeds.find((n: any) => n.id === "targetDummy");
  expect(need.pick?.assetId).toBe(f.dummies[1].assetId);
  expect(need.pick?.option.inspection).toEqual(p.assetDiscovery.groups[0].options.find((o: any) => o.assetId === need.pick.assetId).inspection);
  expect(f.project().proposal?.assetNeeds?.find(n => n.id === "targetDummy")).toEqual(need);
});

it("accepts skip in chat without a model call or separate asset approval", async () => {
  const f = await fixture();
  const before = f.state.calls;
  const result = await f.command("messages", { id: randomUUID(), text: "skip the sound for now" });
  expect(result.status).toBe(200);
  const p = f.project();
  const group = p.assetDiscovery!.groups.find(g => g.id === "hitSound")!;
  expect(pickStatus(p, group).canBuild).toBe(true);
  expect(p.proposal?.assetNeeds?.find(n => n.id === "hitSound")).toMatchObject({ pick: { skip: true } });
  expect(f.state.calls).toBe(before);
  expect(p.conversation?.some(t => /skipped/i.test(t.text))).toBe(true);
});

it("provides a skip action for every unresolved need", async () => {
  const f = await fixture();
  const result = await f.command("asset-picks/skip", { groupId: "hitSound" });
  expect(result.status).toBe(200);
  expect(pickStatus(result.data, result.data.assetDiscovery.groups.find((g: any) => g.id === "hitSound")).canBuild).toBe(true);
});

it("accepts a search type independently of the need media type", async () => {
  const f = await fixture();
  const result = await f.command("asset-picks/search", { groupId: "hitSound", studioId: pickerStudio, query: "sound pack", kind: "Model" });
  expect(result.status).toBe(200);
  expect(result.data.assets.map((a: any) => a.kind)).toContain("Model");
  expect(f.project().proposal?.assetNeeds?.find(n => n.id === "hitSound")?.kind).toBe("Audio");
});

it("does not remove an existing pick when a chat message has no new attachments", async () => {
  const f = await fixture();
  await f.search();
  await f.choose();
  await f.command("messages", { id: randomUUID(), text: "Make the combat faster", assetAttachments: [] });
  const p = await f.app.locals.engine.wait(f.project().id);
  expect(p.assetDiscovery?.choices?.targetDummy?.assetId).toBe(f.dummies[1].assetId);
});

it("selects a captured sound inside a Model without requiring a preview", async () => {
  const f = await fixture();
  const original = f.app.locals.assetLibrary.provider.snapshot;
  f.app.locals.assetLibrary.provider.snapshot = async (...args: Parameters<typeof original>) => snapshotSchema.parse({
    ...await original(...args),
    nodes: [{ name: "SoundPack.Hit", className: "Sound", soundId: `rbxassetid://${f.sound.assetId}` }],
  });
  await f.search("hitSound", "sound pack");
  await f.search();
  const selected = await f.choose(f.dummies[1].assetId, "hitSound");
  const g = selected.data.assetDiscovery.groups.find((g: any) => g.id === "hitSound");
  const sounds = g.options.find((o: any) => o.assetId === f.dummies[1].assetId).previewData?.sounds;
  expect(sounds).toEqual([{ path: "SoundPack.Hit", name: "Hit", assetId: f.sound.assetId }]);
  const result = await f.command("asset-picks/sound", { groupId: "hitSound", assetId: f.dummies[1].assetId, path: sounds[0].path });
  expect(result.status).toBe(200);
  expect(result.data.proposal.assetNeeds.find((n: any) => n.id === "hitSound").pick.sound).toEqual(sounds[0]);
  expect(pickStatus(result.data, result.data.assetDiscovery.groups.find((g: any) => g.id === "hitSound")).canBuild).toBe(true);
});

it("accepts a message while an asset inspection is running", async () => {
  const f = await fixture();
  f.app.locals.engine.assetOperations.add(f.project().id);
  try {
    const r = await f.command("messages", { id: randomUUID(), text: "skip the sound for now" });
    expect(r.status).toBe(200);
    expect(r.data.queuedMessages.at(-1)).toMatchObject({ text: "skip the sound for now", status: "queued" });
  } finally { f.app.locals.engine.assetOperations.delete(f.project().id); }
});

it("migrates recorded worker state and derived duplicates idempotently", () => {
  const p: Project = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
  const workers = structuredClone(p.coordination!.areas);
  migrateAssetNeeds(p);
  expect(p.proposal?.assetStateVersion).toBe(1);
  expect(p.assetDiscovery?.groups).toHaveLength(p.proposal!.assetNeeds!.length);
  expect(p.proposal?.assetNeeds?.find(n => n.id === "PunchAnimation")?.pick?.clipKey).toBe("1/11/1");
  expect(p.coordination!.areas).toEqual(workers);
  const first = structuredClone(p);
  migrateAssetNeeds(p);
  expect(p).toEqual(first);
});

it("routes oversized complete source evidence to the configured reviewer", async () => {
  const f = await fixture();
  const source = "local ordinaryValue = 1\n".repeat(1600);
  f.app.locals.assetLibrary.provider.snapshot = async () => snapshotSchema.parse({ nodes: [{ name: "Dummy.Script", className: "Script" }], scripts: [{ name: "Dummy.Script", source }], complete: true, issues: [] });
  const original = f.app.locals.engine.transport;
  const seen: any[] = [];
  f.app.locals.engine.transport = async (url: any, init: any) => {
    const body = JSON.parse(String(init.body));
    if (!body.messages) return original(url, init);
    const context = JSON.parse(body.messages[1].content);
    seen.push(context);
    return Response.json({ choices: [{ message: { content: JSON.stringify({ scripts: [{ name: "Dummy.Script", action: "keep" }] }) } }], usage: { prompt_tokens: 100, completion_tokens: 50, cost: 0 } });
  };
  await f.search();
  const p = (await f.choose()).data;
  expect(pickStatus(p, p.assetDiscovery.groups[0]).canBuild).toBe(true);
  expect(seen).toHaveLength(1);
  expect(seen[0].sources[0].source).toBe(source);
});

it("has no separate brief or asset approval endpoints", async () => {
  const f = await fixture();
  for (const action of ["approve-brief", "approve-assets", "reopen-assets", "defer-assets"]) {
    expect((await f.command(action)).status).toBe(404);
  }
});

it("keeps a dangerous source unresolved and allows skipping it", async () => {
  const f = await fixture();
  f.state.scripts = 1; f.state.blocked = true;
  await f.search();
  await f.choose();
  expect(pickStatus(f.project(), f.project().assetDiscovery!.groups[0]).canBuild).toBe(false);
  await f.command("asset-picks/skip", { groupId: "targetDummy" });
  expect(pickStatus(f.project(), f.project().assetDiscovery!.groups[0]).canBuild).toBe(true);
});

it("refuses a clip key absent from the captured pack", async () => {
  const f = await fixture();
  await f.search("punchAnimation", "punch animation");
  await f.choose(f.animation.assetId, "punchAnimation");
  const result = await f.command("asset-picks/clip", { groupId: "punchAnimation", assetId: f.animation.assetId, clipKey: "invented" });
  expect(result.status).toBe(409);
  expect(f.project().proposal?.assetNeeds?.find(n => n.id === "punchAnimation")?.pick?.clipKey).toBeUndefined();
});

it("does not interpret a negated skip request as an instruction to drop an asset", async () => {
  const f = await fixture();
  await f.command("messages", { id: randomUUID(), text: "Do not skip the sound" });
  await f.app.locals.engine.wait(f.project().id);
  expect(f.project().proposal?.assetNeeds?.find(n => n.id === "hitSound")?.pick?.skip).not.toBe(true);
});

it("opening the recorded failed project keeps Retry available", async () => {
  const f = await fixture();
  const p: Project = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
  f.app.locals.engine.store.save(p);
  const before = f.app.locals.engine.store.get(p.id);
  const response = await fetch(`${f.origin}/api/projects/${p.id}/asset-picks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: p.revision, studioId: pickerStudio }) });
  expect(response.status).toBe(200);
  const after = f.app.locals.engine.store.get(p.id);
  expect(after.proposal).toEqual(before.proposal);
  expect(after.coordination).toEqual(before.coordination);
  expect(f.state.inspections).toEqual([]);
});

it("one approval uses the displayed defaults for unanswered proposal questions", async () => {
  const f = await fixture();
  for (const id of ["targetDummy", "punchAnimation", "hitSound"]) await f.command("asset-picks/skip", { groupId: id });
  const p = f.project(); p.answers = {}; p.answerQuestions = {};
  const question = proposalQuestions(p).find(q => q.options.some(o => o.id === "keep"))!;
  expect(question).toBeDefined();
  question.recommendedOptionId = question.options.find(o => o.id !== "keep")!.id;
  p.proposal!.questions = [question];
  refreshProposal(p); f.app.locals.engine.store.save(p);
  const response = await f.command("approve-proposal", { hash: p.proposal!.hash });
  expect(response.status).toBe(202);
  f.app.locals.engine.cancel(p.id);
  await f.app.locals.engine.wait(p.id);
  expect(Object.keys(f.project().answers).length).toBeGreaterThan(0);
  expect(f.project().answers[question.id]).toBe(optionAnswer(question, question.recommendedOptionId));
});

it("does not approve or reuse conflicting legacy selections during migration", () => {
  const p: Project = JSON.parse(fs.readFileSync("tests/fixtures/chat-recovery/failed-project.json", "utf8"));
  const need = p.proposal!.assetNeeds!.find(n => n.selectedAssetId)!;
  const group = p.assetDiscovery!.groups.find(g => p.assetDiscovery!.choices?.[g.id]?.assetId === need.selectedAssetId)!;
  const duplicate = structuredClone(group);
  duplicate.id = "conflicting-legacy-group";
  duplicate.assetNeedId = need.id;
  p.assetDiscovery!.groups.push(duplicate);
  p.assetDiscovery!.choices![duplicate.id] = { skip: true, reason: "Skipped by user" };
  p.coordination!.inputHash = coordinationInputHash(p);
  expect(stepRetry(p)).toBeDefined();
  const workers = structuredClone(p.coordination!.areas);
  migrateAssetNeeds(p);
  expect(p.proposal!.assetNeeds!.some(n => n.pick?.error?.includes("conflict"))).toBe(true);
  expect(p.proposal!.approval).toBeUndefined();
  expect(stepRetry(p)).toBeUndefined();
  expect(p.coordination!.inputHash).not.toBe(coordinationInputHash(p));
  expect(p.coordination!.areas).toEqual(workers);
});

it("applies multiple accepted messages in bounded batches without asking the user to combine them", async () => {
  const f = await fixture();
  f.app.locals.engine.assetOperations.add(f.project().id);
  const ids: string[] = [randomUUID(), randomUUID()];
  for (const [i, text] of ["Make combat faster", "Use a straw dummy instead"].entries()) {
    const r = await f.command("messages", { id: ids[i], text: text + " " + "detail ".repeat(470) });
    expect(r.status).toBe(200);
  }
  f.app.locals.engine.assetOperations.delete(f.project().id);
  const result: Project = await f.app.locals.engine.applyQueuedChanges(f.project().id);
  expect(result.queuedMessages?.filter(q => ids.includes(q.id)).map(q => q.status), JSON.stringify({error:result.error,queue:result.queuedMessages?.map(q=>({status:q.status,reason:q.reason}))})).toEqual(["applied", "applied"]);
});

it("applies a message queued behind an active proposal edit to the resulting revision", async () => {
  const f = await fixture();
  const original = f.app.locals.engine.transport;
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  let first = true;
  f.app.locals.engine.transport = async (url: any, init: any) => {
    if (JSON.parse(init.body).messages && first) { first = false; await delayed; }
    return original(url, init);
  };
  await f.command("messages", { id: randomUUID(), text: "Make combat faster" });
  const id = randomUUID();
  await f.command("messages", { id, text: "Use a straw dummy instead" });
  release();
  const result: Project = await f.app.locals.engine.wait(f.project().id);
  expect(result.queuedMessages?.find(q => q.id === id)?.status).toBe("applied");
});


