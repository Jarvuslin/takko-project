import { afterEach, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assertRepairChanges } from "../src/generation/repair";
import { Engine } from "../src/generation/engine";
import { Configuration } from "../src/generation/settings";
import { GenerationStore } from "../src/generation/store";
import { bundleHash } from "../src/generation/validation";
import { fakeTransport, fixtureBundle, profile } from "./generation-fixtures";
import type { Bundle } from "../src/generation/schema";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});
const empty = (): Bundle => ({
  files: [],
  scene: [],
  coverage: [],
  assets: [],
});

it("rejects empty, repeated and reordered repairs, but accepts an actual artifact change", () => {
  const base = fixtureBundle("A farming game", "Forge_Repair");
  expect(() => assertRepairChanges(base, empty())).toThrow("did not change");
  const repeated = structuredClone(base);
  repeated.scene[0].properties = Object.fromEntries(
    Object.entries(repeated.scene[0].properties).reverse(),
  );
  expect(() => assertRepairChanges(base, repeated)).toThrow("did not change");
  repeated.files[0].source = repeated.files[0].source.replace(
    "Value = 1",
    "Value = 2",
  );
  expect(() => assertRepairChanges(base, repeated)).not.toThrow();
  expect(base.files[0].source).toContain("Value = 1");
  expect(() =>
    assertRepairChanges(base, {
      ...empty(),
      scene: [{ ...base.scene[0], path: base.scene[0].path + "/Marker" }],
    }),
  ).not.toThrow();
});

for (const correct of [false, true])
  it(`runtime failure survives a no-op repair${correct ? " until a changed response passes static checks" : " when correction also does nothing"}`, async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "forge-repair-integrity-"),
    );
    directories.push(directory);
    const config = new Configuration(path.join(directory, "configuration"));
    const model = profile();
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
    let repairs = 0;
    let reviewsAfterRepair = 0;
    const transport = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const response = await (await fixture(url, init)).json();
      if (body.messages[0].content.includes("PHASE: reviewer") && repairs)
        reviewsAfterRepair++;
      if (body.messages[0].content.includes("PHASE: repair")) {
        repairs++;
        if (repairs > 1)
          expect(body.messages[1].content).toContain(
            "Repair did not change the artifact",
          );
        const context = JSON.parse(
          body.messages[1].content.split(
            "\nYour last response failed validation.",
          )[0],
        );
        expect(
          context.failures.some(
            (failure: { id: string }) => failure.id === "studio:coreTest",
          ),
        ).toBe(true);
        const patch = empty();
        if (correct && repairs > 1)
          patch.files = [
            {
              ...context.artifact.files[0],
              source: context.artifact.files[0].source.replace(
                "Value = 1",
                "Value = 2",
              ),
            },
          ];
        response.choices[0].message.content = JSON.stringify(patch);
      }
      return Response.json(response);
    }) as typeof fetch;
    const store = new GenerationStore(directory);
    const engine = new Engine(store, config, transport);
    let project = engine.create("A farming game");
    engine.start(project.id, 1, "plan");
    project = await engine.wait(project.id);
    engine.approve(project.id, 1);
    engine.start(project.id, 1, "build");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("ready_to_test");
    const originalHash = bundleHash(project.artifact!);
    const protectedTests = structuredClone(project.review!.tests);
    project.studioEvidence = {
      revision: 1,
      artifactHash: originalHash,
      checks: [
        {
          id: "coreTest",
          status: "failed",
          detail: "Fixture state should initialize to 2",
        },
      ],
      logs: [],
      at: new Date().toISOString(),
    };
    store.save(project);
    engine.start(project.id, 1, "repair");
    project = await engine.wait(project.id);
    expect(repairs).toBe(2);
    expect(project.review!.tests).toEqual(protectedTests);
    if (correct) {
      expect(project.stage).toBe("ready_to_test");
      expect(project.artifact!.files[0].source).toContain("Value = 2");
      expect(
        project.checks.find((check) => check.id === "studio")?.status,
      ).toBe("pending");
      expect(reviewsAfterRepair).toBe(1);
    } else {
      expect(project.stage).toBe("failed");
      expect(bundleHash(project.artifact!)).toBe(originalHash);
      expect(project.studioEvidence?.checks[0].status).toBe("failed");
      expect(reviewsAfterRepair).toBe(0);
      expect(project.failure?.details).toContain("did not change");
    }
  });
