import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { Configuration } from "../src/generation/settings";
import { fakeTransport, profile } from "./generation-fixtures";

it("overrides only reviewer reasoning without mutating the shared model or output limit", async () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-reviewer-reasoning-"),
  );
  try {
    const config = new Configuration(path.join(directory, "configuration"));
    const model = { ...profile(), reasoningEffort: "high" as const };
    config.save({
      profiles: [model],
      routes: {
        planner: [model.id],
        builder: [model.id],
        reviewer: [model.id],
        repair: [model.id],
      },
      budgetMicros: 8_000_000,
      generationBudgetMicros: 8_000_000,
      repairLimit: 0,
    });
    config.setKey(model.id, "offline-only");
    const seen: { phase: string; reasoning: unknown; max: number }[] = [];
    const engine = new Engine(
      new GenerationStore(directory),
      config,
      fakeTransport(),
      async () => [],
      undefined,
      {
        reviewerReasoningEffort: "medium",
        beforeDispatch: ({ phase, profile }) => {
          seen.push({
            phase,
            reasoning: profile.reasoningEffort,
            max: profile.maxOutputTokens,
          });
        },
      },
    );
    const p = engine.create("Create a wind-powered racing course");
    engine.start(p.id, p.revision, "plan");
    const planned = await engine.wait(p.id);
    engine.approve(p.id, planned.revision);
    engine.start(p.id, planned.revision, "build");
    const built = await engine.wait(p.id);
    expect(built.stage, built.error ?? "").toBe("ready_to_test");
    expect(seen.map((s) => [s.phase, s.reasoning])).toEqual([
      ["planner", "high"],
      ["builder", "high"],
      ["reviewer", "medium"],
    ]);
    expect(seen.every((s) => s.max === model.maxOutputTokens)).toBe(true);
    expect(config.read().profiles[0]).toEqual(model);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
