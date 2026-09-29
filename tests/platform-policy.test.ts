import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import {
  initialPlatform,
  requestedPlatform,
  platformPlanningIssues,
  platformInstructions,
  platformQuestion,
  updatedPlatform,
} from "../src/generation/platform-policy";
import { newProject, GenerationStore } from "../src/generation/store";
import { proposalHash } from "../src/generation/proposal";
import { pickerFixture } from "./asset-picking-fixture";
import brief from "./fixtures/asset-picking/real-proposal.json";
import type { Project } from "../src/generation/schema";
import { polishedGenerationPrompt } from "../scripts/polished-generation-spec";
it("keeps explicit touch support in the real authored brief despite ordinary action alternatives and Controller script names", () => {
  const decision = initialPlatform(polishedGenerationPrompt);
  expect(decision.targets).toEqual(["pc", "mobile"]);
  expect(decision.question).toBeUndefined();
});
const directories: string[] = [];
afterEach(() => {
  for (const d of directories.splice(0))
    fs.rmSync(d, { recursive: true, force: true });
});
it("persists PC keyboard and mouse for new projects and leaves legacy projects unmodified", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "takko-platform-"));
  directories.push(d);
  const store = new GenerationStore(d),
    p = newProject(brief.request, 8000000);
  store.save(p);
  expect(store.get(p.id).platform).toEqual({
    kind: "pc",
    targets: ["pc"],
    source: "default",
  });
  const old = JSON.parse(
    fs.readFileSync(
      "docs/results/scope-answer-reuse-20260929/live-after.json",
      "utf8",
    ),
  ) as Project;
  const before = proposalHash(old);
  store.save(old);
  expect(store.get(old.id).platform).toBeUndefined();
  expect(proposalHash(store.get(old.id))).toBe(before);
  expect(updatedPlatform(old, "Add mobile touch support")).toBeUndefined();
});
it.each([
  ["A mobile game with touch controls", ["mobile"]],
  ["A game for console and gamepad", ["console"]],
  ["A VR adventure", ["vr"]],
  ["A game for PC and mobile", ["pc", "mobile"]],
  ["PC keyboard and mouse only. No touch or gamepad support.", ["pc"]],
])("records explicit user platforms: %s", (request, targets) => {
  const p = initialPlatform(request);
  expect(p.targets).toEqual(targets);
  expect(p.question).toBeUndefined();
  expect(p.sourceQuote).toBe(request);
});
it.each([
  "Maybe mobile support for this game",
  "Tap to punch the dummy",
  "A camera controller for this game",
  "Mobile enemies move between platforms",
  "Either PC or console",
])("asks instead of guessing: %s", (request) => {
  const p = newProject(request, 8000000);
  expect(p.platform?.kind).toBe("pc");
  expect(platformQuestion(p)?.allowOther).toBe(true);
  const next = requestedPlatform("PC keyboard and mouse only", p.platform);
  expect(next.question).toBeUndefined();
  expect(updatedPlatform({ ...p, platform: next })).toEqual(next);
});
it("rejects the real c8550a5b planner's click/tap and mobile/console additions on a fresh PC project", () => {
  const p = newProject(brief.request, 8000000);
  expect(brief.proposal.mechanics.text).toContain(
    "tapping (mobile/console equivalent)",
  );
  expect(platformPlanningIssues(p, brief.proposal)).toHaveLength(1);
  expect(
    platformPlanningIssues({ platform: undefined }, brief.proposal),
  ).toEqual([]);
  expect(
    platformPlanningIssues(p, {
      mechanics:
        "Keyboard F and left mouse button punch. No touch buttons or gamepad bindings.",
      tasks: [
        "Create input controller",
        "Read the developer console for errors",
      ],
    }),
  ).toEqual([]);
  expect(platformInstructions(p)).toContain("keyboard and mouse only");
});
it("answers an ambiguous platform without paid work, persists it through revisions, and rejects stale answers", async () => {
  const f = await pickerFixture();
  try {
    const p = f.project();
    p.platform = initialPlatform("Maybe add mobile support");
    f.app.locals.engine.store.save(p);
    expect(
      (await f.command("platform", { answer: "Maybe mobile" })).status,
    ).toBe(409);
    const result = await f.command("platform", {
      answer: "PC keyboard and mouse only",
    });
    expect(result.status).toBe(200);
    expect(result.data.platform.question).toBeUndefined();
    expect(result.data.answers.target_platform).toBe(
      "PC keyboard and mouse only",
    );
    expect(
      (
        await f.command("platform", {
          answer: "Mobile touch controls",
          revision: p.revision,
        })
      ).status,
    ).toBe(409);
    const saved = f.project();
    const revised = f.app.locals.engine.revise(
      saved.id,
      saved.revision,
      saved.request,
      saved.answers,
    );
    expect(revised.platform).toEqual(saved.platform);
    expect(f.state.calls).toBe(0);
  } finally {
    await f.close();
  }
});
