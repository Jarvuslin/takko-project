import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { checkInputBindings } from "../src/generation/input-binding-check";
import { newProject, GenerationStore } from "../src/generation/store";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { fakeTransport, profile, fixtureBundle } from "./generation-fixtures";
import type { Project } from "../src/generation/schema";
import brief from "./fixtures/asset-picking/real-proposal.json";
const p = newProject(brief.request, 8000000);
const checks = (source: string) => {
  const b = fixtureBundle(p.request, p.scope);
  b.files[0].source = source;
  return checkInputBindings(b, p);
};
it("flags actual generated controller bindings, while preserving the original existing game", () => {
  const old = JSON.parse(
    fs.readFileSync(
      "docs/results/approved-reference-finish-20260927/terminal-project.json",
      "utf8",
    ),
  ) as Project;
  expect(
    old.artifact!.files.some((f) => f.source.includes("Enum.KeyCode.ButtonR2")),
  ).toBe(true);
  expect(
    checkInputBindings(old.artifact!, p).some(
      (c) => c.status === "failed" && c.detail.includes("gamepad"),
    ),
  ).toBe(true);
  expect(checkInputBindings(old.artifact!, old)).toEqual([]);
});
it.each([
  "input.TouchTap:Connect(punch)",
  "input.TouchTapInWorld:Connect(punch)",
  "if input.UserInputType == Enum.UserInputType.Gamepad1 then punch() end",
  'cas:BindAction("Punch", punch, true, Enum.KeyCode.F)',
  'cas:BindActionAtPriority("Punch", punch, true, 100, Enum.KeyCode.F)',
  'cas:BindAction("Punch", punch, createTouchButton, Enum.KeyCode.F)',
  "local key = Enum.KeyCode.DPadUp",
  "local key = Enum.KeyCode.Thumbstick1",
])("returns actionable correction for %s", (source) => {
  expect(checks(source)[0]).toMatchObject({ status: "failed" });
  expect(checks(source)[0].detail).toContain("Remove these bindings");
});
it("accepts keyboard/mouse and physical Touched events, ignores comments and literal examples", () => {
  expect(
    checks(`-- Enum.KeyCode.ButtonR2
 --[=[ input.TouchTap:Connect(punch) ]=]
 local example = "Enum.UserInputType.Touch"
 local text = [[cas:BindAction('x',f,true)]]
 cas:BindAction("Punch", function(_, state) punch(state) end, false, Enum.KeyCode.F)
 if input.UserInputType == Enum.UserInputType.MouseButton1 then punch() end
 part.Touched:Connect(hit)`),
  ).toEqual([]);
});
it("sends an invalid builder submission back through the existing correction loop", async () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "takko-input-correction-"));
  try {
    const config = new Configuration(path.join(d, "config")),
      model = profile();
    config.save({
      profiles: [model],
      routes: {
        planner: [model.id],
        builder: [model.id],
        reviewer: [model.id],
        repair: [],
      },
      budgetMicros: 8000000,
      repairLimit: 0,
    });
    const base = fakeTransport();
    let builders = 0,
      sawCorrection = false;
    const transport: typeof fetch = async (url, init) => {
      const request = JSON.parse(String(init?.body));
      const response = await base(url, init);
      if (!request.messages[0].content.includes("PHASE: builder"))
        return response;
      builders++;
      expect(request.messages[0].content).toContain("keyboard and mouse only");
      if (builders > 1) {
        sawCorrection = request.messages.some((m: any) =>
          String(m.content).includes("Saved target is PC"),
        );
        return response;
      }
      const payload = await response.json(),
        value = JSON.parse(payload.choices[0].message.content);
      value.files[0].source +=
        '\ngame:GetService("ContextActionService"):BindAction("Punch", function() end, true, Enum.KeyCode.ButtonR2)';
      payload.choices[0].message.content = JSON.stringify(value);
      return Response.json(payload);
    };
    const engine = new Engine(
      new GenerationStore(d),
      config,
      transport,
      async () => [],
    );
    let project = engine.create("Build a farming game");
    engine.start(project.id, project.revision, "plan");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("review");
    engine.approve(project.id, project.revision);
    engine.start(project.id, project.revision, "build");
    project = await engine.wait(project.id);
    expect(builders).toBe(2);
    expect(sawCorrection).toBe(true);
    expect(project.stage).toBe("ready_to_test");
    expect(checkInputBindings(project.artifact!, project)).toEqual([]);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});
