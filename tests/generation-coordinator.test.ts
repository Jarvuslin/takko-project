import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Configuration } from "../src/generation/settings";
import { Engine } from "../src/generation/engine";
import { GenerationStore, newProject } from "../src/generation/store";
import {
  executeWithCoordinator,
  coordinationInputHash,
  planWithCoordinator,
  readyTasks,
  validateDecision,
  type CoordinatorHost,
} from "../src/generation/coordinator";
import { bundleHash, validateSpec } from "../src/generation/validation";
import type { Bundle, Project, Spec } from "../src/generation/schema";
import { profile } from "./generation-fixtures";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});

function requirement(id: string, description: string) {
  return {
    id,
    description,
    sourceId: "request",
    sourceQuote: "",
    origin: "user" as const,
    category: "mechanic" as const,
    priority: "required" as const,
    acceptance: `${description} is observable in generated state.`,
  };
}

function task(
  id: string,
  requirements: string[],
  dependsOn: string[],
  files: string[],
) {
  return { id, title: `Implement ${id}`, requirements, dependsOn, files };
}

function projectWithSpec(): Project {
  const project = newProject(
    "Build a wind glider game with server-owned energy and a client HUD.",
    2_000_000,
  );
  const server = `ServerScriptService/${project.scope}/Glider.server.luau`;
  const client = `StarterPlayer/StarterPlayerScripts/${project.scope}/Hud.client.luau`;
  project.spec = {
    title: "Wind Glider",
    summary: "A server-authoritative gliding loop with visible energy.",
    visualDirection: "Clear blue sky and readable energy feedback.",
    questions: [],
    requirements: [
      requirement("flight", "Players can glide using server-owned energy"),
      requirement("hud", "Players see current energy on a HUD"),
    ],
    tasks: [
      task("flight_task", ["flight"], [], [server]),
      task("hud_task", ["hud"], ["flight_task"], [client]),
    ],
  };
  project.approvedRevision = project.revision;
  project.stage = "generating";
  project.artifact = { files: [], scene: [], coverage: [], assets: [] };
  project.completedBuildTasks = [];
  return project;
}

function coordinatorHost(
  project: Project,
  request: CoordinatorHost["request"],
  execute: CoordinatorHost["execute"] = async () => {},
  controller = new AbortController(),
): CoordinatorHost {
  return {
    project,
    signal: controller.signal,
    request,
    execute,
    repairLimit: 1,
    save: () => {},
    validatePlan: (value) => value,
  };
}

describe("persistent staged planning", () => {
  it("resumes after an area failure without replaying the outline or successful area", async () => {
    const project = newProject(
      "Build a wind glider game with server-owned energy and a client HUD.",
      2_000_000,
    );
    const calls: string[] = [];
    let failHud = true;
    const request: CoordinatorHost["request"] = async (_phase, context) => {
      const coordination = context.coordination as any;
      calls.push(
        coordination.step +
          (coordination.area ? `:${coordination.area.id}` : ""),
      );
      if (coordination.step === "outline")
        return {
          title: "Wind Glider",
          summary: "Server energy drives a readable glider loop.",
          visualDirection: "Blue sky and high contrast UI.",
          questions: [],
          sharedContracts:
            "The server owns energy. The client receives numeric energy updates.",
          areas: [
            {
              id: "flight",
              title: "Flight",
              objective: "Own energy and flight",
              dependsOn: [],
            },
            {
              id: "hud",
              title: "HUD",
              objective: "Render server energy",
              dependsOn: ["flight"],
            },
          ],
        } as any;
      if (coordination.area.id === "hud" && failHud) {
        failHud = false;
        throw Error("fixture interruption after first area");
      }
      const id = coordination.area.id as "flight" | "hud";
      return {
        requirements: [
          requirement(
            `${id}_requirement`,
            id === "flight"
              ? "Players can glide using server-owned energy"
              : "Players see current energy on a HUD",
          ),
        ],
        tasks: [
          task(
            `${id}_task`,
            [`${id}_requirement`],
            id === "hud" ? ["flight_task"] : [],
            [
              id === "flight"
                ? `ServerScriptService/${project.scope}/Glider.server.luau`
                : `StarterPlayer/StarterPlayerScripts/${project.scope}/Hud.client.luau`,
            ],
          ),
        ],
      } as any;
    };

    await expect(
      planWithCoordinator(coordinatorHost(project, request), {}),
    ).rejects.toThrow("fixture interruption");
    expect(Object.keys(project.coordination!.areas)).toEqual(["flight"]);
    expect(
      project.coordination!.workers.map((receipt) => receipt.status),
    ).toEqual(["completed", "completed", "failed"]);

    await planWithCoordinator(coordinatorHost(project, request), {});
    expect(calls).toEqual(["outline", "area:flight", "area:hud", "area:hud"]);
    expect(project.spec!.tasks.map((entry) => entry.id)).toEqual([
      "flight_task",
      "hud_task",
    ]);
    expect(project.stage).toBe("review");
  });

  it("rejects an area result when the brief changes in flight instead of checkpointing stale work", async () => {
    const project = newProject(
      "Build a wind glider game with server-owned energy and a client HUD.",
      2_000_000,
    );
    const request: CoordinatorHost["request"] = async (_phase, context) => {
      const coordination = context.coordination as any;
      if (coordination.step === "outline")
        return {
          title: "Wind Glider",
          summary: "Gliding",
          visualDirection: "Readable sky",
          questions: [],
          sharedContracts: "Server owns energy.",
          areas: [
            {
              id: "flight",
              title: "Flight",
              objective: "Build flight",
              dependsOn: [],
            },
          ],
        } as any;
      project.request =
        "Build a racing game instead, with checkpoints and timed laps.";
      return {
        requirements: [requirement("flight_requirement", "Players can glide")],
        tasks: [
          task(
            "flight_task",
            ["flight_requirement"],
            [],
            [`ServerScriptService/${project.scope}/Glider.server.luau`],
          ),
        ],
      } as any;
    };
    await expect(
      planWithCoordinator(coordinatorHost(project, request), {}),
    ).rejects.toThrow("brief changed during coordination");
    expect(project.coordination!.areas).toEqual({});
    expect(project.spec).toBeNull();
    expect(project.coordination!.workers.at(-1)!.status).toBe("failed");
  });

  it("allows architecture requirements to arrive in a later area while validating each partial area", async () => {
    const project = newProject(
      "Build a server flight system connected to a client HUD.",
      2_000_000,
    );
    project.architecture = {
      nodes: [
        {
          id: "flight",
          name: "Flight",
          purpose: "Own authoritative flight energy",
          authority: "server",
          x: 0,
          y: 0,
        },
        {
          id: "hud",
          name: "HUD",
          purpose: "Display replicated flight energy",
          authority: "client",
          x: 200,
          y: 0,
        },
      ],
      edges: [
        {
          id: "energy",
          from: "flight",
          to: "hud",
          event: "EnergyChanged",
          effect: "Updates the visible energy meter",
          kind: "state",
        },
      ],
    };
    const architectureIds = [
      "architecture:node:flight",
      "architecture:node:hud",
      "architecture:edge:energy",
    ];
    const request: CoordinatorHost["request"] = async (_phase, context) => {
      const c = context.coordination as any;
      if (c.step === "outline")
        return {
          title: "Flight HUD",
          summary: "Connected flight and HUD",
          visualDirection: "Readable",
          questions: [],
          sharedContracts: "EnergyChanged carries a numeric value.",
          areas: [
            {
              id: "base",
              title: "Base",
              objective: "Create general loop",
              dependsOn: [],
            },
            {
              id: "contracts",
              title: "Contracts",
              objective: "Implement saved architecture",
              dependsOn: ["base"],
            },
          ],
        } as any;
      if (c.area.id === "base")
        return {
          requirements: [requirement("base_loop", "Players can glide")],
          tasks: [
            task(
              "base_task",
              ["base_loop"],
              [],
              [`ServerScriptService/${project.scope}/Base.server.luau`],
            ),
          ],
        } as any;
      const requirements = architectureIds.map((sourceId, index) => ({
        ...requirement(`contracts_${index}`, `Implement ${sourceId}`),
        sourceId,
      }));
      return {
        requirements,
        tasks: requirements.map((entry, index) =>
          task(
            `contracts_task_${index}`,
            [entry.id],
            ["base_task"],
            [
              index === 0
                ? `ServerScriptService/${project.scope}/Flight.server.luau`
                : `ReplicatedStorage/${project.scope}/Contract${index}.luau`,
            ],
          ),
        ),
      } as any;
    };
    const host = coordinatorHost(project, request);
    host.validatePlan = (value) => validateSpec(value, project);
    await planWithCoordinator(host, {});
    expect(project.spec!.requirements.map((entry) => entry.sourceId)).toEqual([
      "request",
      ...architectureIds,
    ]);
  });

  it("asks which cached area is invalid and replans that area's dependent closure", async () => {
    const project = newProject(
      "Build a wind glider game with server energy and a HUD.",
      2_000_000,
    );
    const steps: string[] = [];
    let rejectAssembly = true;
    const request: CoordinatorHost["request"] = async (_phase, context) => {
      const c = context.coordination as any;
      steps.push(c.step + (c.area ? `:${c.area.id}` : ""));
      if (c.step === "outline")
        return {
          title: "Glider",
          summary: "Flight",
          visualDirection: "Readable",
          questions: [],
          sharedContracts: "Server owns energy.",
          areas: [
            {
              id: "flight",
              title: "Flight",
              objective: "Flight",
              dependsOn: [],
            },
            { id: "hud", title: "HUD", objective: "HUD", dependsOn: [] },
          ],
        } as any;
      if (c.step === "correct_plan")
        return {
          areaId: "flight",
          reason: "Flight owns the broken contract",
        } as any;
      const id = c.area.id;
      return {
        requirements: [requirement(`${id}_requirement`, `Implement ${id}`)],
        tasks: [
          task(
            `${id}_task`,
            [`${id}_requirement`],
            id === "hud" ? ["flight_task"] : [],
            [
              `${id === "hud" ? "ReplicatedStorage" : "ServerScriptService"}/${project.scope}/${id}.luau`,
            ],
          ),
        ],
      } as any;
    };
    const host = coordinatorHost(project, request);
    host.validatePlan = (value) => {
      if (rejectAssembly) {
        rejectAssembly = false;
        throw Error("cross-area contract is invalid");
      }
      return value;
    };
    await expect(planWithCoordinator(host, {})).rejects.toThrow(
      "cross-area contract",
    );
    await planWithCoordinator(host, {});
    expect(steps).toEqual([
      "outline",
      "area:flight",
      "area:hud",
      "correct_plan",
      "area:flight",
      "area:hud",
    ]);
    expect(project.coordination!.assemblyIssue).toBeUndefined();
  });
});

describe("dynamic execution policy", () => {
  it("reorders dependency-ready work, rejects premature finish, and reaches only ready_to_test after an independent review", async () => {
    const project = projectWithSpec();
    const decisions = [
      { action: "finish" },
      {
        action: "delegate",
        taskId: "flight_task",
        objective: "Build authoritative energy first",
      },
      {
        action: "delegate",
        taskId: "hud_task",
        objective: "Connect the HUD after its dependency",
      },
      {
        action: "review",
        objective: "Independently review the complete artifact",
      },
      { action: "finish" },
    ];
    const observedReady: string[][] = [];
    const executed: string[] = [];
    let index = 0;
    const host = coordinatorHost(
      project,
      async (_phase, context, _schema, validate) => {
        observedReady.push(
          ((context.coordination as any).readyTasks ?? []).map(
            (entry: any) => entry.id,
          ),
        );
        const decision = decisions[index++] as any;
        try {
          await validate?.(decision);
          return decision;
        } catch (error) {
          if (decision.action !== "finish") throw error;
          expect((error as Error).message).toContain("Cannot finish");
          const replacement = decisions[index++] as any;
          await validate?.(replacement);
          return replacement;
        }
      },
      async (kind, _objective, taskId) => {
        executed.push(taskId ?? kind);
        if (kind === "build") project.completedBuildTasks!.push(taskId!);
        else {
          project.review = {
            issues: [],
            tests: project.spec!.requirements.map((entry) => ({
              id: `${entry.id}_test`,
              requirementId: entry.id,
              mode: "server" as const,
              source:
                "return function() assert(true, 'observable fixture') end",
            })),
          };
          project.checks = [
            {
              id: "static",
              status: "passed",
              detail: "fixture compiler passed",
            },
          ];
        }
      },
    );

    await executeWithCoordinator(host);
    expect(observedReady.slice(0, 4)).toEqual([
      ["flight_task"],
      ["hud_task"],
      [],
      [],
    ]);
    expect(executed).toEqual(["flight_task", "hud_task", "review"]);
    expect(project.stage).toBe("ready_to_test");
    expect(project.checks.at(-1)).toMatchObject({
      id: "studio",
      status: "pending",
    });
  });

  it("preserves requirements, files, and external dependencies when splitting an unstarted task", async () => {
    const project = projectWithSpec();
    const serverTask = project.spec!.tasks[0];
    project.spec!.tasks[1].dependsOn = [serverTask.id];
    const state = {
      version: 1 as const,
      revision: project.revision,
      inputHash: "fixture",
      areas: {},
      workers: [],
      decisions: 0,
      repairs: 0,
      status: "executing" as const,
    };
    expect(() =>
      validateDecision(
        project,
        state,
        {
          action: "split",
          taskId: serverTask.id,
          reason: "drop scope",
          tasks: [
            task("energy", ["hud"], [], [serverTask.files[0]]),
            task("flight", serverTask.requirements, [], []),
          ],
        },
        1,
      ),
    ).toThrow("preserve exactly");

    const actions = [
      {
        action: "split",
        taskId: serverTask.id,
        reason: "separate state from controls",
        tasks: [
          task("energy", serverTask.requirements, [], [serverTask.files[0]]),
          task("flight", serverTask.requirements, ["energy"], []),
        ],
      },
      {
        action: "blocked",
        reason: "fixture stops after observing the saved split",
      },
    ];
    await expect(
      executeWithCoordinator(
        coordinatorHost(
          project,
          async (_phase, _context, _schema, validate) => {
            const action = actions.shift() as any;
            await validate?.(action);
            return action;
          },
        ),
      ),
    ).rejects.toThrow("fixture stops");
    expect(
      project.spec!.tasks.find((entry) => entry.id === "hud_task")!.dependsOn,
    ).toEqual(["energy", "flight"]);
    expect(project.spec!.tasks.flatMap((entry) => entry.files)).toContain(
      serverTask.files[0],
    );
    expect(
      project
        .spec!.tasks.filter((entry) => ["energy", "flight"].includes(entry.id))
        .flatMap((entry) => entry.requirements),
    ).toContain("flight");
  });

  it("keeps failed receipts and resumes without replaying completed workers", async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-coordinator-resume-"),
    );
    directories.push(directory);
    const store = new GenerationStore(directory);
    let project = store.save(projectWithSpec());
    let failHud = true;
    const requested: string[] = [];
    const request: CoordinatorHost["request"] = async (
      _phase,
      context,
      _schema,
      validate,
    ) => {
      const ready = (
        (context.coordination as any).readyTasks as Spec["tasks"]
      )[0];
      const action: any = ready
        ? {
            action: "delegate",
            taskId: ready.id,
            objective: `Build ${ready.id}`,
          }
        : { action: "blocked", reason: "fixture complete boundary" };
      await validate?.(action);
      return action;
    };
    const execute: CoordinatorHost["execute"] = async (
      _kind,
      _objective,
      taskId,
    ) => {
      requested.push(taskId!);
      if (taskId === "hud_task" && failHud) {
        failHud = false;
        throw Error("worker disconnected");
      }
      project.completedBuildTasks!.push(taskId!);
    };
    let host = coordinatorHost(project, request, execute);
    host.save = () => {
      store.save(project);
    };
    await expect(executeWithCoordinator(host)).rejects.toThrow(
      "worker disconnected",
    );
    project = store.get(project.id);
    host = coordinatorHost(project, request, execute);
    host.save = () => {
      store.save(project);
    };
    await expect(executeWithCoordinator(host)).rejects.toThrow(
      "fixture complete boundary",
    );
    expect(requested).toEqual(["flight_task", "hud_task", "hud_task"]);
    expect(
      project.coordination!.workers.map((entry) => [
        entry.taskId,
        entry.status,
      ]),
    ).toEqual([
      ["flight_task", "completed"],
      ["hud_task", "failed"],
      ["hud_task", "completed"],
    ]);
  });

  it("marks an aborted worker interrupted and never commits its result", async () => {
    const project = projectWithSpec();
    const controller = new AbortController();
    const host = coordinatorHost(
      project,
      async (_phase, _context, _schema, validate) => {
        const action: any = {
          action: "delegate",
          taskId: "flight_task",
          objective: "Build flight",
        };
        await validate?.(action);
        return action;
      },
      async () => controller.abort(),
      controller,
    );
    await expect(executeWithCoordinator(host)).rejects.toThrow("cancelled");
    expect(project.completedBuildTasks).toEqual([]);
    expect(project.coordination!.workers.at(-1)!.status).toBe("interrupted");
  });

  it("does not consume repair allowance on a failed worker and accepts scene paths for repair", async () => {
    const project = projectWithSpec();
    project.completedBuildTasks = project.spec!.tasks.map((entry) => entry.id);
    project.artifact!.scene.push({
      path: `Workspace/${project.scope}/Ramp`,
      className: "Part",
      properties: { Anchored: true },
    });
    project.review = {
      issues: [],
      tests: [
        {
          id: "flight_test",
          requirementId: "flight",
          mode: "server",
          source: "return function() assert(true) end",
        },
      ],
    };
    project.checks = [
      { id: "review:flight", status: "failed", detail: "Ramp is misplaced" },
    ];
    project.coordination = {
      version: 1,
      revision: project.revision,
      inputHash: coordinationInputHash(project),
      areas: {},
      workers: [],
      decisions: 0,
      repairs: 0,
      reviewHash: bundleHash(project.artifact!),
      status: "executing",
    };
    let attempts = 0;
    const scenePath = project.artifact!.scene[0].path;
    const request: CoordinatorHost["request"] = async (
      _phase,
      _context,
      _schema,
      validate,
    ) => {
      const action: any = {
        action: "repair",
        objective: "Move the ramp",
        paths: [scenePath],
      };
      await validate?.(action);
      return action;
    };
    const execute: CoordinatorHost["execute"] = async () => {
      if (++attempts === 1) throw Error("repair denied before output");
      throw Error("stop after proving allowance remains available");
    };
    await expect(
      executeWithCoordinator(coordinatorHost(project, request, execute)),
    ).rejects.toThrow("repair denied");
    expect(project.coordination.repairs).toBe(0);
    await expect(
      executeWithCoordinator(coordinatorHost(project, request, execute)),
    ).rejects.toThrow("stop after proving");
    expect(attempts).toBe(2);
    expect(project.coordination.repairs).toBe(0);
  });

  it("commits a successful repair receipt and allowance atomically with the artifact", async () => {
    const project = projectWithSpec();
    project.completedBuildTasks = project.spec!.tasks.map((entry) => entry.id);
    project.artifact!.files.push({
      path: project.spec!.tasks[0].files[0],
      kind: "Script",
      source: "local energy = 0",
    });
    project.review = {
      issues: [],
      tests: [
        {
          id: "flight_test",
          requirementId: "flight",
          mode: "server",
          source: "return function() assert(true) end",
        },
      ],
    };
    project.checks = [
      { id: "review:flight", status: "failed", detail: "Energy never changes" },
    ];
    project.coordination = {
      version: 1,
      revision: project.revision,
      inputHash: coordinationInputHash(project),
      areas: {},
      workers: [],
      decisions: 0,
      repairs: 0,
      reviewHash: bundleHash(project.artifact!),
      status: "executing",
    };
    const repairedSource = "local energy = 100";
    const request: CoordinatorHost["request"] = async (
      _phase,
      _context,
      _schema,
      validate,
    ) => {
      const action: any = {
        action: "repair",
        objective: "Restore energy",
        paths: [project.artifact!.files[0].path],
      };
      await validate?.(action);
      return action;
    };
    const host = coordinatorHost(project, request);
    host.execute = async (_kind, _objective, _taskId, _paths, commit) => {
      project.artifact!.files[0].source = repairedSource;
      commit?.();
      throw Error("simulated process loss after durable commit");
    };
    await expect(executeWithCoordinator(host)).rejects.toThrow("process loss");
    expect(project.artifact!.files[0].source).toBe(repairedSource);
    expect(project.coordination.repairs).toBe(1);
    expect(project.coordination.workers.at(-1)).toMatchObject({
      kind: "repair",
      status: "completed",
    });
    expect(project.coordination.workers.at(-1)!.outputArtifactHash).toBe(
      bundleHash(project.artifact!),
    );
  });

  it("persists a decision before dispatch and revalidates it after restart without asking again", async () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-pending-decision-"),
    );
    directories.push(directory);
    const store = new GenerationStore(directory);
    let project = store.save(projectWithSpec());
    let requests = 0;
    let crash = true;
    const request: CoordinatorHost["request"] = async (
      _phase,
      _context,
      _schema,
      validate,
    ) => {
      requests++;
      const action: any = {
        action: "delegate",
        taskId: "flight_task",
        objective: "Build flight from shared contract",
      };
      await validate?.(action);
      return action;
    };
    let host = coordinatorHost(
      project,
      request,
      async (_kind, _objective, taskId) => {
        project.completedBuildTasks!.push(taskId!);
        throw Error("stop after resumed dispatch");
      },
    );
    host.save = (message) => {
      store.save(project);
      if (crash && message.startsWith("Coordinator: delegate")) {
        crash = false;
        throw Error("host crashed after decision checkpoint");
      }
    };
    await expect(executeWithCoordinator(host)).rejects.toThrow("host crashed");
    project = store.get(project.id);
    expect(project.coordination!.pendingDecision).toMatchObject({
      action: "delegate",
      taskId: "flight_task",
    });
    expect(project.coordination!.decisionHistory).toHaveLength(1);
    host = coordinatorHost(
      project,
      request,
      async (_kind, _objective, taskId) => {
        project.completedBuildTasks!.push(taskId!);
        throw Error("stop after resumed dispatch");
      },
    );
    await expect(executeWithCoordinator(host)).rejects.toThrow(
      "stop after resumed dispatch",
    );
    expect(requests).toBe(1);
    expect(project.coordination!.decisionHistory).toHaveLength(1);
  });
});

function response(value: unknown) {
  return Response.json({
    choices: [
      { finish_reason: "stop", message: { content: JSON.stringify(value) } },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 100 },
  });
}

function integratedTransport(
  calls: { phase: string; context: any }[],
): typeof fetch {
  return (async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
    const context = JSON.parse(
      body.messages[1].content.split(
        "\nYour last response failed validation.",
      )[0],
    );
    calls.push({ phase, context });
    const step = context.coordination?.step;
    if (step === "outline")
      return response({
        title: "Wind Glider",
        summary: "A server-authoritative glider with visible energy.",
        visualDirection: "Blue sky and high contrast energy feedback.",
        questions: [],
        sharedContracts:
          "Server owns energy. Client observes a numeric replicated energy value.",
        areas: [
          {
            id: "flight",
            title: "Flight",
            objective: "Create authoritative energy",
            dependsOn: [],
          },
          {
            id: "hud",
            title: "HUD",
            objective: "Display replicated energy",
            dependsOn: ["flight"],
          },
        ],
      });
    if (step === "area") {
      const area = context.coordination.area.id;
      return response({
        requirements: [
          requirement(
            `${area}_requirement`,
            area === "flight"
              ? "Players can glide using server-owned energy"
              : "Players see current energy on a HUD",
          ),
        ],
        tasks: [
          task(
            `${area}_task`,
            [`${area}_requirement`],
            area === "hud" ? ["flight_task"] : [],
            [
              area === "flight"
                ? `ServerScriptService/${context.namespace}/Glider.server.luau`
                : `StarterPlayer/StarterPlayerScripts/${context.namespace}/Hud.client.luau`,
            ],
          ),
        ],
      });
    }
    if (step === "decide") {
      const coordination = context.coordination;
      if (coordination.readyTasks.length)
        return response({
          action: "delegate",
          taskId: coordination.readyTasks[0].id,
          objective: `Implement ${coordination.readyTasks[0].id}`,
        });
      if (!coordination.currentReview)
        return response({
          action: "review",
          objective: "Review all requirements independently",
        });
      if (context.checks.some((entry: any) => entry.status === "failed"))
        return response({
          action: "repair",
          objective: "Repair the failed evidence",
          paths: [context.artifactIndex[0].path],
        });
      return response({ action: "finish" });
    }
    if (phase === "builder") {
      const currentTask = context.task;
      const file = currentTask.files[0];
      return response({
        files: [
          {
            path: file,
            kind: file.includes("StarterPlayer") ? "LocalScript" : "Script",
            source:
              "local state = Instance.new('IntValue')\nstate.Value = 100\nstate.Parent = script.Parent\n",
          },
        ],
        scene: [],
        assets: [],
        coverage: currentTask.requirements.map((requirementId: string) => ({
          requirementId,
          status: "implemented",
          detail: "State is created by the owned script",
          files: [file],
        })),
      });
    }
    if (phase === "reviewer")
      return response({
        issues: [],
        tests: context.spec.requirements.map((entry: any) => ({
          id: `${entry.id}_test`,
          requirementId: entry.id,
          mode: "server",
          source:
            "return function(ctx) assert(ctx.scope ~= nil, 'scope supplied') end",
        })),
      });
    if (phase === "repair")
      return response({
        files: context.artifact.files
          .filter((file: any) => context.permittedPaths.includes(file.path))
          .map((file: any) => ({
            ...file,
            source: `${file.source}\nlocal repairedFromEvidence = true`,
          })),
        scene: [],
        coverage: [],
        assets: [],
      });
    throw Error(`Unexpected ${phase} request`);
  }) as typeof fetch;
}

describe("Engine coordinator integration", () => {
  function setup(generationBudgetMicros = 2_000_000) {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "takko-coordinator-"),
    );
    directories.push(directory);
    const config = new Configuration(path.join(directory, "config"));
    const model = profile();
    config.save({
      profiles: [model],
      routes: {
        planner: [model.id],
        builder: [model.id],
        reviewer: [model.id],
        repair: [model.id],
      },
      budgetMicros: 2_000_000,
      generationBudgetMicros,
      repairLimit: 1,
    });
    const store = new GenerationStore(directory);
    return { directory, config, model, store };
  }

  it("routes outline, areas, decisions, legacy workers, and review through one persisted coordinated run", async () => {
    const calls: { phase: string; context: any }[] = [];
    const { config, store } = setup();
    const compiler = async (_bundle: Bundle) => [];
    const engine = new Engine(
      store,
      config,
      integratedTransport(calls),
      compiler,
      undefined,
      { coordinated: true },
    );
    let project = engine.create(
      "Build a wind glider game with server-owned energy and a client HUD.",
    );
    expect(project.executionMode).toBe("coordinator");
    engine.start(project.id, project.revision, "plan");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("review");
    engine.approve(project.id, project.revision);
    engine.start(project.id, project.revision, "build");
    project = await engine.wait(project.id);

    expect(project.stage).toBe("ready_to_test");
    expect(project.completedBuildTasks).toEqual(["flight_task", "hud_task"]);
    expect(
      project.coordination!.workers.filter((entry) => entry.kind === "build"),
    ).toHaveLength(2);
    expect(
      project.coordination!.workers.filter((entry) => entry.kind === "review"),
    ).toHaveLength(1);
    const builders = calls.filter((entry) => entry.phase === "builder");
    expect(builders.map((entry) => entry.context.sharedContracts)).toEqual([
      "Server owns energy. Client observes a numeric replicated energy value.",
      "Server owns energy. Client observes a numeric replicated energy value.",
    ]);
    expect(builders.map((entry) => entry.context.workerAssignment)).toEqual([
      expect.objectContaining({
        kind: "build",
        taskId: "flight_task",
        objective: "Implement flight_task",
      }),
      expect.objectContaining({
        kind: "build",
        taskId: "hud_task",
        objective: "Implement hud_task",
      }),
    ]);
    expect(
      calls.map(
        (entry) =>
          `${entry.phase}:${entry.context.coordination?.step ?? "worker"}`,
      ),
    ).toEqual([
      "planner:outline",
      "planner:area",
      "planner:area",
      "planner:decide",
      "builder:worker",
      "planner:decide",
      "builder:worker",
      "planner:decide",
      "reviewer:review_requirement",
      "reviewer:review_requirement",
      "planner:decide",
    ]);
    expect(project.checks).toContainEqual(
      expect.objectContaining({ id: "studio", status: "pending" }),
    );
    expect(project.charges).toHaveLength(calls.length);
  });

  it("rejects an unaffordable coordinated call before transport dispatch", async () => {
    let dispatches = 0;
    const { config, store } = setup(1_000);
    const transport: typeof fetch = (async () => {
      dispatches++;
      throw Error("transport must not run");
    }) as typeof fetch;
    const engine = new Engine(
      store,
      config,
      transport,
      async () => [],
      undefined,
      { coordinated: true },
    );
    const project = engine.create(
      "Build a wind glider game with server-owned energy and a client HUD.",
    );
    engine.start(project.id, project.revision, "plan");
    const failed = await engine.wait(project.id);
    expect(failed.stage).toBe("failed");
    expect(failed.error).toMatch(/budget|reserve/i);
    expect(dispatches).toBe(0);
    expect(failed.charges).toHaveLength(0);
  });

  it("resumes a bounded review without replaying a saved requirement result", async () => {
    const calls: { phase: string; context: any }[] = [];
    const base = integratedTransport(calls);
    let invalidHudResponses = 2;
    const transport: typeof fetch = (async (url, init) => {
      const body = JSON.parse(String(init?.body));
      const phase = /PHASE: (\w+)/.exec(body.messages[0].content)![1];
      const context = JSON.parse(
        body.messages[1].content.split(
          "\nYour last response failed validation.",
        )[0],
      );
      if (
        phase === "reviewer" &&
        context.coordination?.requirementId === "hud_requirement" &&
        invalidHudResponses-- > 0
      ) {
        calls.push({ phase, context });
        return response({ issues: [], tests: [] });
      }
      return base(url, init);
    }) as typeof fetch;
    const { config, store } = setup();
    const engine = new Engine(
      store,
      config,
      transport,
      async () => [],
      undefined,
      { coordinated: true },
    );
    let project = engine.create(
      "Build a wind glider game with server-owned energy and a client HUD.",
    );
    engine.start(project.id, project.revision, "plan");
    project = await engine.wait(project.id);
    engine.approve(project.id, project.revision);
    engine.start(project.id, project.revision, "build");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("failed");
    expect(
      project.coordination!.reviewParts!.results.flight_requirement,
    ).toBeTruthy();
    expect(
      project.coordination!.reviewParts!.results.hud_requirement,
    ).toBeUndefined();

    engine.start(project.id, project.revision, "repair");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("ready_to_test");
    const reviewed = calls
      .filter((entry) => entry.phase === "reviewer")
      .map((entry) => entry.context.coordination.requirementId);
    expect(reviewed).toEqual([
      "flight_requirement",
      "hud_requirement",
      "hud_requirement",
      "hud_requirement",
    ]);
  });

  it("invalidates an old passing review when failing Studio evidence arrives and reviews before repair", async () => {
    const calls: { phase: string; context: any }[] = [];
    const { config, store } = setup();
    const engine = new Engine(
      store,
      config,
      integratedTransport(calls),
      async () => [],
      undefined,
      { coordinated: true },
    );
    let project = engine.create(
      "Build a wind glider game with server-owned energy and a client HUD.",
    );
    engine.start(project.id, project.revision, "plan");
    project = await engine.wait(project.id);
    engine.approve(project.id, project.revision);
    engine.start(project.id, project.revision, "build");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("ready_to_test");
    project.studioEvidence = {
      revision: project.revision,
      artifactHash: bundleHash(project.artifact!),
      checks: [
        {
          id: "runtime-energy",
          status: "failed",
          detail: "Energy remains zero in Studio",
        },
      ],
      logs: ["Runtime observed Energy=0"],
      at: new Date().toISOString(),
    };
    store.save(project);
    const marker = calls.length;
    engine.start(project.id, project.revision, "repair");
    project = await engine.wait(project.id);
    expect(project.stage).toBe("ready_to_test");
    const retry = calls.slice(marker);
    const decisions = retry.filter((entry) => entry.phase === "planner");
    expect(decisions[0].context.coordination.currentReview).toBe(false);
    expect(decisions[0].context.studioEvidence.checks[0].detail).toContain(
      "Energy remains zero",
    );
    expect(retry.map((entry) => entry.phase)).toContain("repair");
    expect(retry.findIndex((entry) => entry.phase === "reviewer")).toBeLessThan(
      retry.findIndex((entry) => entry.phase === "repair"),
    );
    expect(decisions.at(-1)!.context.coordination.currentReview).toBe(true);
  });

  it("store recovery marks an in-flight coordinator worker interrupted", () => {
    const { directory, store } = setup();
    const project = projectWithSpec();
    project.jobId = "4d276f51-7394-42f4-a239-7bc9d735b6a0";
    project.coordination = {
      version: 1,
      revision: project.revision,
      inputHash: coordinationInputHash(project),
      areas: {},
      decisions: 1,
      repairs: 0,
      status: "executing",
      workers: [
        {
          id: "worker-1",
          kind: "build",
          objective: "Build flight",
          taskId: "flight_task",
          status: "running",
          startedAt: new Date().toISOString(),
        },
      ],
    };
    store.save(project);
    new GenerationStore(directory).recover();
    const recovered = store.get(project.id);
    expect(recovered.stage).toBe("interrupted");
    expect(recovered.coordination!.workers[0]).toMatchObject({
      status: "interrupted",
      error: "Server restarted. Resume from the last validated checkpoint.",
    });
    expect(recovered.coordination!.workers[0].finishedAt).toBeTruthy();
  });
});
