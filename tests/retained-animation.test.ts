import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../src/generation/engine";
import { GenerationStore } from "../src/generation/store";
import { Configuration } from "../src/generation/settings";
import { providerSchema } from "../src/generation/schema";
import { expect, it } from "vitest";
import type { Project } from "../src/generation/schema";
import { componentBuilderContext } from "../src/generation/component-integration";
import { validateRetainedAnimations } from "../src/generation/retained-animation";

const p: Project = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/regression/retained-animation/terminal-project.json",
    "utf8",
  ),
);
const directory = `tests/fixtures/regression/retained-animation/asset-evidence/${p.id}`;
const files = p.artifact!.files;

it("resume exposes the producer context and rejects the real bad patch before replacing any saved work", async () => {
  const temp = fs.mkdtempSync(
    path.join(os.tmpdir(), "takko-retained-animation-"),
  );
  try {
    fs.cpSync(directory, path.join(temp, "asset-evidence", p.id), {
      recursive: true,
    });
    const store = new GenerationStore(temp);
    const saved = structuredClone(p);
    const file = files.find((f) => f.path.includes("PunchController"))!;
    const owner = saved.spec!.tasks.find((t) => t.files.includes(file.path))!;
    saved.completedBuildTasks = saved.completedBuildTasks!.filter(
      (id) => id !== owner.id,
    );
    store.save(saved);
    const config = new Configuration(path.join(temp, "config"));
    const model = providerSchema.parse(p.assetPipeline!.inputContext!.worker);
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
    let entered = false;
    const engine = new Engine(
      store,
      config,
      async () => {
        throw Error("No paid transport in offline reproduction");
      },
      async () => [],
      undefined,
      {
        opencode: {
          preflight() {},
          async run(job) {
            entered = true;
            const contextTool = job.tools.find(
              (t) => t.name === "task_context",
            )!;
            const context: any = await contextTool.execute({
              taskId: owner.id,
            });
            expect(
              context.retainedComponents.find(
                (c: any) => c.reference.needId === "punchAnim",
              ).studioAnimation.code,
            ).toContain("RegisterKeyframeSequence");
            expect(context.animationCapabilityContract.target).toContain(
              "Studio place for testing",
            );
            expect(
              context.unmetAssetRequirements.some(
                (g: any) => g.kind === "publishing_limitation",
              ),
            ).toBe(false);
            const submit = job.tools.find((t) => t.name === "submit_task")!;
            await expect(
              submit.execute({
                taskId: owner.id,
                patch: { files: [file], scene: [], assets: [], coverage: [] },
              }),
            ).rejects.toThrow(/PunchController.*punchAnim.*Workspace/);
            expect(job.project.artifact!.files).toEqual(p.artifact!.files);
            expect(job.project.assetPipeline).toEqual(p.assetPipeline);
            expect(job.project.completedBuildTasks).toEqual(
              saved.completedBuildTasks,
            );
            const localPattern = context.retainedComponents.find(
              (c: any) => c.reference.needId === "punchAnim",
            ).studioAnimation.code;
            const correctedSource = file.source.replace(
              'local PUNCH_ANIMATION_ID = "rbxassetid://12061946559"',
              localPattern
                .split("local animation =")[0]
                .replace("local registeredId =", "local PUNCH_ANIMATION_ID ="),
            );
            // Fixing the animation alone must not admit this preserved bundle:
            // its real config still refers to a nonexistent retained import wrapper.
            await expect(
              submit.execute({
                taskId: owner.id,
                patch: {
                  files: [{ ...file, source: correctedSource }],
                  scene: [],
                  assets: [],
                  coverage: p.artifact!.coverage.filter((c) =>
                    owner.requirements.includes(c.requirementId),
                  ),
                },
              }),
            ).rejects.toThrow(/PunchConfig.*missing from exported hierarchy/);
            expect(
              job.project.artifact!.files.find((f) => f.path === file.path)
                ?.source,
            ).toBe(file.source);
            expect(
              job.project.artifact!.files.filter((f) => f.path !== file.path),
            ).toEqual(files.filter((f) => f.path !== file.path));
            throw Error("Offline reproduction complete");
          },
        },
      },
    );
    engine.start(saved.id, saved.revision, "repair");
    const result = await engine.wait(saved.id);
    expect(entered, result.error ?? "").toBe(true);
    expect(result.error).toContain("Offline reproduction complete");
    expect(result.artifact!.files.filter((f) => f.path !== file.path)).toEqual(
      files.filter((f) => f.path !== file.path),
    );
    expect(result.charges).toEqual(p.charges);
    expect(result.generation).toEqual(p.generation);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

it("rejects the preserved real pack ID assignment using retained acquisition provenance", () => {
  expect(() => validateRetainedAnimations(p, directory, files)).toThrow(
    /PunchController.*punchAnim.*Workspace\/Forge_8a81efe9b8ed\/Assets\/punchAnim/,
  );
});

it("supplies the mapped local sequence and concrete Studio playback code from retained evidence", () => {
  const context = componentBuilderContext(p, directory).find(
    (c) => c.reference.needId === "punchAnim",
  )!;
  expect(context.localContent).toMatchObject({
    destinationPath: context.reference.destinationPath,
    rootName: context.reference.rootName,
  });
  expect(context.studioAnimation?.code).toContain(
    "RegisterKeyframeSequence(sequence)",
  );
  expect(context.studioAnimation?.code).toContain(
    "animation.AnimationId = registeredId",
  );
  expect(context.studioAnimation?.code).toContain("Animator");
  expect(context.studioAnimation?.playbackContract.execution).toContain(
    "same runtime context",
  );
  expect(context.studioAnimation?.playbackContract.lifetime).toContain(
    "Not valid in published games",
  );
  expect(context.studioAnimation?.sequencePath).toContain("punching animation");
});

it("accepts the producer's local registration pattern and ignores pack IDs in comments or unrelated properties", () => {
  const context = componentBuilderContext(p, directory).find(
    (c) => c.reference.needId === "punchAnim",
  )!;
  const file = files.find((f) => f.path.includes("PunchController"))!;
  expect(() =>
    validateRetainedAnimations(p, directory, [
      {
        ...file,
        source:
          context.studioAnimation!.code +
          '\n-- animation.AnimationId = "rbxassetid://12061946559"\nlocal metadata = "rbxassetid://12061946559"',
      },
    ]),
  ).not.toThrow();
});

it("catches a direct property assignment as well as the real constant alias", () => {
  const file = files.find((f) => f.path.includes("PunchController"))!;
  expect(() =>
    validateRetainedAnimations(p, directory, [
      {
        ...file,
        source:
          'local animation = Instance.new("Animation")\nanimation["AnimationId"] = "rbxassetid://12061946559"',
      },
    ]),
  ).toThrow(/punchAnim/);
});
