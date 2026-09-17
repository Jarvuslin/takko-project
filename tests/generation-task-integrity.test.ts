import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine, validateTaskScene } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import type { Bundle } from "../src/generation/schema";
import { fakeTransport, fixtureBundle, profile } from "./generation-fixtures";
import type { compileSources } from "../src/generation/validation";
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    const target = path.resolve(directory);
    if (
      !target.startsWith(path.resolve(os.tmpdir()) + path.sep) ||
      !path.basename(target).startsWith("forge-integrity-")
    )
      throw Error("Unexpected test cleanup path");
    fs.rmSync(target, { recursive: true, force: true });
  }
});
const empty = (): Bundle => ({
  files: [],
  scene: [],
  coverage: [],
  assets: [],
});
const compiler: typeof compileSources = async (bundle, tests = []) => [
  ...bundle.files.map((file) => ({
    id: "compile:" + file.path,
    status: file.source.includes("local = broken")
      ? ("failed" as const)
      : ("passed" as const),
    detail: file.source.includes("local = broken")
      ? "Expected identifier near ="
      : "Compiler fixture accepted source",
  })),
  ...tests.map((test) => ({
    id: "compile:" + test.id,
    status: "passed" as const,
    detail: "Test compiler fixture",
  })),
];
function setup(
  transform: (phase: string, context: any, output: any, input: string) => void,
) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "forge-integrity-"));
  directories.push(directory);
  const config = new Configuration(path.join(directory, "config")),
    model = profile();
  config.save({
    profiles: [model],
    routes: {
      planner: [model.id],
      builder: [model.id],
      reviewer: [model.id],
      repair: [model.id],
    },
    budgetMicros: 2e6,
    repairLimit: 1,
  });
  const fixture = fakeTransport();
  const transport = (async (url, init) => {
    const body = JSON.parse(String(init?.body));
    const input = body.messages[1].content;
    const context = JSON.parse(
      input.split("\nYour last response failed validation.")[0],
    );
    const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
    const data = await (await fixture(url, init)).json();
    const output = JSON.parse(data.choices[0].message.content);
    if (phase === "planner")
      output.tasks.push({
        id: "integration",
        title: "Add presentation",
        requirements: ["core"],
        dependsOn: ["coreTask"],
        files: [],
      });
    if (phase === "builder" && context.task.id === "integration")
      output.files = [];
    transform(phase, context, output, input);
    data.choices[0].message.content = JSON.stringify(output);
    return Response.json(data);
  }) as typeof fetch;
  return new Engine(
    new GenerationStore(directory),
    config,
    transport,
    compiler,
  );
}
async function build(engine: Engine) {
  let p = engine.create("Build a farming game");
  engine.start(p.id, p.revision, "plan");
  p = await engine.wait(p.id);
  expect(p.stage).toBe("review");
  engine.approve(p.id, p.revision);
  engine.start(p.id, p.revision, "build");
  return engine.wait(p.id);
}
it("corrects a later task's scene overwrite while preserving earlier ground properties", async () => {
  let attempts = 0;
  const engine = setup((phase, context, output, input) => {
    if (phase !== "builder" || context.task.id !== "integration") return;
    if (++attempts === 1)
      output.scene[0].properties = {
        Color: { type: "Color3", value: [1, 0, 0] },
      };
    else {
      expect(input).toContain(
        "Earlier completed task owns scene node Workspace/",
      );
      expect(context.current.scene[0].properties).toHaveProperty(
        "Anchored",
        true,
      );
      output.scene = [
        {
          path: output.scene[0].path + "/Prompt",
          className: "ProximityPrompt",
          properties: {},
        },
      ];
    }
  });
  const project = await build(engine);
  expect(project.stage).toBe("ready_to_test");
  expect(attempts).toBe(2);
  expect(project.artifact!.scene[0].properties).toMatchObject({
    Anchored: true,
    Size: { type: "Vector3", value: [40, 1, 40] },
  });
  expect(project.artifact!.scene[1].path).toContain("/Ground/Prompt");
  expect(project.completedBuildTasks).toEqual(["coreTask", "integration"]);
});
it("leaves the offending task incomplete when it repeatedly replaces a prior scene class", async () => {
  const engine = setup((phase, context, output) => {
    if (phase === "builder" && context.task.id === "integration")
      output.scene[0] = {
        path: output.scene[0].path,
        className: "Folder",
        properties: {},
      };
  });
  const project = await build(engine);
  expect(project.stage).toBe("failed");
  expect(project.completedBuildTasks).toEqual(["coreTask"]);
  expect(project.artifact!.scene[0].className).toBe("Part");
  expect(project.error).toContain("Earlier completed task owns scene node");
});
it("allows identical declarations with reordered property keys and newly added descendants", () => {
  const base = fixtureBundle("Build a farming game", "Scope"),
    patch = empty();
  patch.scene = [
    {
      properties: {
        Color: { value: [0.2, 0.4, 0.3], type: "Color3" },
        Size: { value: [40, 1, 40], type: "Vector3" },
        Anchored: true,
      },
      className: "Part",
      path: base.scene[0].path,
    },
    {
      path: base.scene[0].path + "/Prompt",
      className: "ProximityPrompt",
      properties: {},
    },
  ];
  expect(() => validateTaskScene(base, patch)).not.toThrow();
});
it("corrects task syntax before downstream context sees the dependency", async () => {
  let attempts = 0,
    dependencySeen = false;
  const engine = setup((phase, context, output, input) => {
    if (phase !== "builder") return;
    if (context.task.id === "coreTask") {
      if (++attempts === 1) output.files[0].source = "local = broken";
      else
        expect(input).toContain(
          "Task scripts must compile before becoming dependencies",
        );
    } else {
      dependencySeen = true;
      expect(context.current.files[0].source).toContain(
        'Instance.new("IntValue")',
      );
      expect(context.current.files[0].source).not.toContain("local = broken");
      output.scene = [];
    }
  });
  const project = await build(engine);
  expect(project.stage).toBe("ready_to_test");
  expect(attempts).toBe(2);
  expect(dependencySeen).toBe(true);
  expect(project.charges.filter((c) => c.phase === "repair")).toHaveLength(0);
});
it("does not checkpoint invalid syntax or call downstream builders and reviewers", async () => {
  const phases: string[] = [];
  const engine = setup((phase, context, output) => {
    phases.push(phase + ":" + (context.task?.id ?? ""));
    if (phase === "builder") output.files[0].source = "local = broken";
  });
  const project = await build(engine);
  expect(project.stage).toBe("failed");
  expect(project.completedBuildTasks).toEqual([]);
  expect(project.artifact!.files).toEqual([]);
  expect(phases).toEqual(["planner:", "builder:coreTask", "builder:coreTask"]);
  expect(project.error).toContain("Task scripts must compile");
});
it("separates future task files from current output and explicitly corrects comment-only ownership stubs", async () => {
  let firstTaskAttempts = 0;
  let clientPath = "";
  const engine = setup((phase, context, output, input) => {
    if (phase === "planner") {
      clientPath = `StarterPlayer/StarterPlayerScripts/${context.namespace}/Controller.client.luau`;
      output.tasks[1].files = [clientPath];
      return;
    }
    if (phase !== "builder") return;
    expect(context.outputContract.taskId).toBe(context.task.id);
    expect(context.outputContract.requiredFiles).toEqual(context.task.files);
    expect(context.outputContract.requirementIds).toEqual(
      context.task.requirements,
    );
    if (context.task.id === "coreTask") {
      expect(context.outputContract.reservedFiles).toContainEqual({
        path: clientPath,
        ownerTaskId: "integration",
        availability: "not_built_yet",
      });
      expect(context.instructions).toContain(
        "not a request to implement future tasks",
      );
      if (++firstTaskAttempts === 1)
        output.files.push({
          path: clientPath,
          kind: "LocalScript",
          source:
            "-- Owned by the client task; retained here only as dependency evidence.",
        });
      else {
        expect(input).toContain("Remove this file entry entirely");
        expect(input).toContain("comment-only stub is still an overwrite");
      }
    } else {
      expect(context.outputContract.reservedFiles[0].availability).toBe(
        "existing_read_only",
      );
      expect(context.current.files).toHaveLength(1);
      output.files = [
        {
          path: clientPath,
          kind: "LocalScript",
          source: "local controllerStarted = true",
        },
      ];
    }
  });
  const project = await build(engine);
  expect(firstTaskAttempts).toBe(2);
  expect(project.stage).toBe("ready_to_test");
  expect(project.completedBuildTasks).toEqual(["coreTask", "integration"]);
  expect(
    project.artifact!.files.find((file) => file.path === clientPath)?.source,
  ).toBe("local controllerStarted = true");
  expect(
    project.artifact!.files.some((file) =>
      file.source.includes("retained here only"),
    ),
  ).toBe(false);
});
it("continues rejecting foreign-task placeholders instead of silently filtering a model response", async () => {
  let clientPath = "";
  const engine = setup((phase, context, output) => {
    if (phase === "planner") {
      clientPath = `StarterPlayer/StarterPlayerScripts/${context.namespace}/Controller.client.luau`;
      output.tasks[1].files = [clientPath];
    } else if (phase === "builder")
      output.files.push({
        path: clientPath,
        kind: "LocalScript",
        source: "-- Future client implementation",
      });
  });
  const project = await build(engine);
  expect(project.stage).toBe("failed");
  expect(project.completedBuildTasks).toEqual([]);
  expect(project.artifact!.files).toEqual([]);
  expect(project.failure?.details).toContain("Remove this file entry entirely");
});
