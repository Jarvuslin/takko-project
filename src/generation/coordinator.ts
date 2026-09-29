import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  specSchema,
  taskSchema,
  type Phase,
  type Project,
  type Spec,
} from "./schema";
import { plannerOutputSchema } from "./requirements";
import { bundleHash, validateSpec } from "./validation";

const identifier = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/);
const explanation = z.string().trim().min(1).max(2400);
export const outlineSchema = specSchema
  .pick({
    title: true,
    summary: true,
    visualDirection: true,
    questions: true,
    architectureProposal: true,
    assetStrategy: true,
  })
  .extend({
    sharedContracts: explanation,
    areas: z
      .array(
        z
          .object({
            id: identifier,
            title: z.string().trim().min(1).max(120),
            objective: explanation,
            dependsOn: z.array(identifier).max(10),
          })
          .strict(),
      )
      .min(1)
      .max(10),
  })
  .strict();
type Outline = z.infer<typeof outlineSchema>;
export type WorkerReceipt = {
  revision?: number;
  inputHash?: string;
  id: string;
  kind: string;
  objective: string;
  taskId?: string;
  status: "running" | "completed" | "failed" | "interrupted";
  startedAt: string;
  finishedAt?: string;
  error?: string;
  inputArtifactHash?: string;
  outputArtifactHash?: string;
  findings?: { detail: string; paths: string[] }[];
};
export type Coordination = {
  history?: {
    revision: number;
    inputHash: string;
    outline?: Outline;
    areas: Record<string, Spec>;
  }[];
  version: 1;
  revision: number;
  inputHash: string;
  outline?: Outline;
  areas: Record<string, Spec>;
  workers: WorkerReceipt[];
  decisions: number;
  decisionHistory?: { at: string; action: Decision }[];
  pendingDecision?: Decision;
  repairs: number;
  reviewHash?: string;
  reviewParts?: {
    artifactHash: string;
    results: Record<string, import("./schema").Review>;
  };
  assemblyIssue?: string;
  planningFeedback?: string;
  status: "planning" | "executing" | "ready_to_test";
};
export type CoordinatorHost = {
  project: Project;
  signal: AbortSignal;
  request<T>(
    phase: Phase,
    context: Record<string, unknown>,
    schema: z.ZodType<T>,
    validate?: (value: T) => void | Promise<void>,
  ): Promise<T>;
  save(message: string): void;
  validatePlan(value: Spec): Spec;
  execute(
    kind: "build" | "review" | "repair",
    objective: string,
    taskId?: string,
    paths?: string[],
    commit?: () => void,
  ): Promise<void>;
  repairLimit: number;
};
export function coordinationInputHash(p: Project) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        p.revision,
        p.request,
        p.answers,
        p.briefChanges,
        p.architecture,
        p.assetAttachments,
        p.assetDiscovery,
        p.concept,
        p.research,
        ...(p.rig ? [p.rig] : []),
      ]),
    )
    .digest("hex");
}
function stateFor(p: Project): Coordination {
  const inputHash = coordinationInputHash(p);
  if (
    !p.coordination ||
    p.coordination.inputHash !== inputHash ||
    p.coordination.revision !== p.revision
  ) {
    const previous = p.coordination;
    const reusable =
      p.proposalPlan?.hash === p.proposal?.hash && !!p.proposalPlan;
    p.coordination = {
      version: 1,
      revision: p.revision,
      inputHash,
      areas: reusable ? (previous?.areas ?? {}) : {},
      outline: reusable ? previous?.outline : undefined,
      workers: previous?.workers ?? [],
      decisions: previous?.decisions ?? 0,
      repairs: previous?.repairs ?? 0,
      history: previous
        ? [
            ...(previous.history ?? []),
            {
              revision: previous.revision,
              inputHash: previous.inputHash,
              outline: previous.outline,
              areas: previous.areas,
            },
          ]
        : [],
      status: "planning",
    };
  }
  return p.coordination;
}
function assertCurrent(host: CoordinatorHost, state: Coordination) {
  if (host.signal.aborted)
    throw Error("Generation cancelled. Completed worker results are saved.");
  if (
    host.project.revision !== state.revision ||
    coordinationInputHash(host.project) !== state.inputHash
  )
    throw Error(
      "The brief changed during coordination. Replan before applying worker results.",
    );
}
async function worker<T>(
  host: CoordinatorHost,
  state: Coordination,
  kind: string,
  objective: string,
  taskId: string | undefined,
  run: (commit: (result: T) => void) => Promise<T>,
  commit: (result: T) => void = () => {},
) {
  assertCurrent(host, state);
  const receipt: WorkerReceipt = {
    revision: host.project.revision,
    inputHash: state.inputHash,
    id: randomUUID(),
    kind,
    objective,
    taskId,
    status: "running",
    startedAt: new Date().toISOString(),
    inputArtifactHash: host.project.artifact
      ? bundleHash(host.project.artifact)
      : undefined,
  };
  state.workers.push(receipt);
  host.save("Worker started: " + objective);
  const commitResult = (result: T) => {
    if (receipt.status === "completed") return;
    assertCurrent(host, state);
    commit(result);
    receipt.status = "completed";
    receipt.finishedAt = new Date().toISOString();
    receipt.outputArtifactHash = host.project.artifact
      ? bundleHash(host.project.artifact)
      : undefined;
  };
  try {
    const result = await run(commitResult);
    commitResult(result);
    return result;
  } catch (error) {
    if (receipt.status !== "completed") {
      receipt.status = host.signal.aborted ? "interrupted" : "failed";
      receipt.error = (error as Error).message.slice(0, 2400);
    }
    throw error;
  } finally {
    receipt.finishedAt = new Date().toISOString();
    host.save("Worker " + receipt.status + ": " + objective);
  }
}
export function validateOutline(outline: Outline) {
  const ids = new Set(outline.areas.map((a) => a.id));
  if (ids.size !== outline.areas.length)
    throw Error("Planning area IDs must be unique");
  const done = new Set<string>(),
    active = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id))
      throw Error("Planning areas contain a dependency cycle");
    if (done.has(id)) return;
    const area = outline.areas.find((a) => a.id === id);
    if (!area) throw Error("Unknown planning area dependency: " + id);
    active.add(id);
    area.dependsOn.forEach(visit);
    active.delete(id);
    done.add(id);
  };
  outline.areas.forEach((a) => visit(a.id));
}
export async function planWithCoordinator(
  host: CoordinatorHost,
  context: Record<string, unknown>,
) {
  const p = host.project,
    state = stateFor(p);
  state.status = "planning";
  if (!state.outline) {
    await worker(
      host,
      state,
      "coordinator",
      "Define game systems and shared contracts",
      undefined,
      () =>
        host.request(
          "planner",
          {
            ...context,
            coordination: { step: "outline" },
            instructions:
              "You coordinate temporary workers for this complete game. Return a compact outline and bounded planning areas, not the full specification or source code. Preserve EVERY requested mechanic, animation, sound, effect and approved asset. Areas partition implementation responsibilities, not the scope delivered. Define shared server/client interfaces, states, event payloads and ownership in sharedContracts. Use dependencies where one area needs another's contracts. Include consequential questions only when unresolved. Saved architecture contracts must remain represented. Each area will independently produce requirements and small owned tasks. Keep each area focused enough to finish with the configured response allowance.",
          },
          outlineSchema,
          validateOutline,
        ),
      (value) => {
        state.outline = value;
      },
    );
  }
  const outline = state.outline!;
  validateOutline(outline);
  if (state.assemblyIssue) {
    const correctionSchema = z
      .object({
        areaId: z.enum(outline.areas.map((area) => area.id)),
        reason: explanation,
      })
      .strict();
    const correction = await host.request(
      "planner",
      {
        ...context,
        coordination: {
          step: "correct_plan",
          outline,
          completedPlans: state.areas,
          error: state.assemblyIssue,
        },
        instructions:
          "The saved planning areas did not assemble into a valid complete plan. Choose the area responsible for the reported contract failure. That area and its dependants will be re-planned, preserving all original scope. Do not return a replacement whole plan.",
      },
      correctionSchema,
    );
    const invalidated = new Set([correction.areaId]);
    for (let pass = 0; pass < outline.areas.length; pass++) {
      const invalidTasks = new Set(
        [...invalidated].flatMap(
          (id) => state.areas[id]?.tasks.map((task) => task.id) ?? [],
        ),
      );
      for (const area of outline.areas)
        if (
          area.dependsOn.some((id) => invalidated.has(id)) ||
          state.areas[area.id]?.tasks.some((task) =>
            task.dependsOn.some((id) => invalidTasks.has(id)),
          )
        )
          invalidated.add(area.id);
    }
    for (const id of invalidated) delete state.areas[id];
    state.planningFeedback = state.assemblyIssue;
    state.assemblyIssue = undefined;
    host.save(
      "Replanning invalid areas: " +
        [...invalidated].join(", ") +
        ". " +
        correction.reason,
    );
  }
  const areaSchema = plannerOutputSchema(p)
    .pick({
      requirements: true,
      tasks: true,
      assetNeeds: true,
      referenceDecisions: true,
    })
    .extend({
      requirements: plannerOutputSchema(p).shape.requirements.max(8),
      tasks: z
        .array(taskSchema.extend({ files: taskSchema.shape.files.max(2) }))
        .min(1)
        .max(4),
    })
    .strict();
  while (outline.areas.some((area) => !state.areas[area.id])) {
    const area = outline.areas.find(
      (a) => !state.areas[a.id] && a.dependsOn.every((id) => state.areas[id]),
    );
    if (!area) throw Error("Planning areas cannot make progress");
    const previous = Object.values(state.areas);
    await worker(
      host,
      state,
      "planning",
      area.title,
      area.id,
      () =>
        host.request(
          "planner",
          {
            ...context,
            coordination: {
              step: "area",
              correction: state.planningFeedback,
              area,
              sharedContracts: outline.sharedContracts,
              otherAreas: outline.areas,
              completedPlans: previous,
            },
            instructions: `Act as a temporary planning worker for area ${area.id}. Preserve its full scope and shared contracts. Return only this area's requirements, small tasks, assetNeeds and referenceDecisions. Prefix EVERY requirement, task and asset-need ID with ${area.id}_. Each task owns at most two scripts. Use files: [] for discovery-dependent work. Cover every requirement you declare. Depend only on this area's tasks or completedPlans task IDs. Do not redeclare other areas' files or requirements. Source every user requirement from userSources. Requirements from saved architecture must use their exact sourceId. No invented asset IDs or permission to drop requested media. Complete output means this area only.`,
          },
          areaSchema,
          (value) => {
            for (const item of [
              ...value.requirements,
              ...value.tasks,
              ...(value.assetNeeds ?? []),
            ])
              if (!item.id.startsWith(area.id + "_"))
                throw Error("Worker IDs must start with " + area.id + "_");
            validateSpec(
              {
                ...outline,
                requirements: [
                  ...previous.flatMap((s) => s.requirements),
                  ...value.requirements,
                ],
                tasks: [...previous.flatMap((s) => s.tasks), ...value.tasks],
              },
              p,
              { partial: true },
            );
            const ids = new Set(value.requirements.map((r) => r.id));
            if (value.assetNeeds?.some((a) => !ids.has(a.requirementId)))
              throw Error(
                "Asset needs must belong to this area's requirements",
              );
            // The final area completes the candidate. Check assembly in the same
            // correction callback, before accepting this area's output.
            if (
              outline.areas.every((a) => a.id === area.id || state.areas[a.id])
            ) {
              const {
                areas: _areas,
                sharedContracts: _contracts,
                ...header
              } = outline;
              const parts = [...previous, value];
              host.validatePlan(
                specSchema.parse({
                  ...header,
                  requirements: parts.flatMap((s) => s.requirements),
                  tasks: parts.flatMap((s) => s.tasks),
                  assetNeeds: parts.flatMap((s) => s.assetNeeds ?? []),
                  referenceDecisions: parts.flatMap(
                    (s) => s.referenceDecisions ?? [],
                  ),
                }),
              );
            }
          },
        ),
      (value) => {
        state.areas[area.id] = {
          title: outline.title,
          summary: outline.summary,
          visualDirection: outline.visualDirection,
          questions: [],
          ...value,
        };
      },
    );
  }
  const parts = outline.areas.map((a) => state.areas[a.id]);
  const { areas: _areas, sharedContracts: _contracts, ...header } = outline;
  try {
    const combined = specSchema.parse({
      ...header,
      requirements: parts.flatMap((s) => s.requirements),
      tasks: parts.flatMap((s) => s.tasks),
      assetNeeds: parts.flatMap((s) => s.assetNeeds ?? []),
      referenceDecisions: parts.flatMap((s) => s.referenceDecisions ?? []),
    });
    p.spec = host.validatePlan(combined);
    state.assemblyIssue = undefined;
    state.planningFeedback = undefined;
  } catch (error) {
    state.assemblyIssue = (error as Error).message.slice(0, 3000);
    host.save(
      "Plan assembly needs correction. Saved areas will be reviewed on the next planning attempt.",
    );
    throw error;
  }
  p.name = p.spec.title;
  p.stage = p.spec.questions.length ? "clarification" : "review";
  host.save(
    "Coordinator plan complete. Review the assembled game plan before building.",
  );
}

export const decisionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("delegate"),
      taskId: z.string().min(1).max(64),
      objective: explanation,
    })
    .strict(),
  z
    .object({
      action: z.literal("inspect"),
      objective: explanation,
      paths: z.array(z.string().min(1).max(240)).min(1).max(8),
    })
    .strict(),
  z
    .object({
      action: z.literal("split"),
      taskId: z.string().min(1).max(64),
      reason: explanation,
      tasks: z
        .array(taskSchema.extend({ files: taskSchema.shape.files.max(2) }))
        .min(2)
        .max(4),
    })
    .strict(),
  z.object({ action: z.literal("review"), objective: explanation }).strict(),
  z
    .object({
      action: z.literal("repair"),
      objective: explanation,
      paths: z.array(z.string().min(1).max(240)).min(1).max(8),
    })
    .strict(),
  z.object({ action: z.literal("finish") }).strict(),
  z.object({ action: z.literal("blocked"), reason: explanation }).strict(),
]);
type Decision = z.infer<typeof decisionSchema>;
const inspectionSchema = z
  .object({
    findings: z
      .array(
        z
          .object({
            detail: explanation,
            paths: z.array(z.string()).min(1).max(8),
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict();
export function readyTasks(p: Project) {
  const completed = new Set(p.completedBuildTasks ?? []);
  return p.spec!.tasks.filter(
    (t) => !completed.has(t.id) && t.dependsOn.every((d) => completed.has(d)),
  );
}
export function validateDecision(
  p: Project,
  state: Coordination,
  action: Decision,
  repairLimit: number,
) {
  const complete = p.spec!.tasks.every((t) =>
    p.completedBuildTasks?.includes(t.id),
  );
  const reviewed = !!p.artifact && state.reviewHash === bundleHash(p.artifact);
  const failed = p.checks.some((c) => c.status === "failed");
  if (
    action.action === "delegate" &&
    !readyTasks(p).some((t) => t.id === action.taskId)
  )
    throw Error(
      "Delegate only an unfinished task whose dependencies are complete",
    );
  if (action.action === "review" && !complete)
    throw Error(
      "Independent final review requires all build tasks to be complete",
    );
  if (
    action.action === "repair" &&
    (!complete || !reviewed || !failed || state.repairs >= repairLimit)
  )
    throw Error(
      "Repair requires a current failed review and a remaining repair allowance",
    );
  if (
    action.action === "finish" &&
    (!complete || !reviewed || failed || !p.review)
  )
    throw Error(
      "Cannot finish: complete every task and obtain a current independent review with no failed checks",
    );
  if (action.action === "inspect" || action.action === "repair") {
    const paths = new Set(
      [
        ...(p.artifact?.files ?? []),
        ...(action.action === "repair" ? (p.artifact?.scene ?? []) : []),
      ].map((item) => item.path),
    );
    if (action.paths.some((path) => !paths.has(path)))
      throw Error("Worker paths must identify existing generated content");
  }
  if (action.action === "split") refinedSpec(p, action);
}
function refinedSpec(
  p: Project,
  action: Extract<Decision, { action: "split" }>,
): Spec {
  const original = p.spec!.tasks.find((t) => t.id === action.taskId);
  if (!original || p.completedBuildTasks?.includes(original.id))
    throw Error("Only an unstarted task can be split");
  if (p.assetPipeline?.entries.some((e) => e.component))
    throw Error(
      "Retained component contracts are already bound. Delegate the existing task without changing its integration ownership",
    );
  const requirements = new Set(action.tasks.flatMap((t) => t.requirements));
  if (
    requirements.size !== new Set(original.requirements).size ||
    original.requirements.some((id) => !requirements.has(id))
  )
    throw Error(
      "Splitting must preserve exactly the original task's requirement IDs",
    );
  const files = action.tasks.flatMap((t) => t.files);
  if (
    files.length !== original.files.length ||
    original.files.some((f) => !files.includes(f))
  )
    throw Error("Splitting must preserve every owned file exactly once");
  const childIds = action.tasks.map((t) => t.id);
  if (
    childIds.includes(original.id) ||
    new Set(childIds).size !== childIds.length ||
    p.spec!.tasks.some((t) => childIds.includes(t.id))
  )
    throw Error("Split workers need new unique task IDs");
  for (const t of action.tasks) {
    if (
      t.dependsOn.some(
        (id) => !childIds.includes(id) && !original.dependsOn.includes(id),
      )
    )
      throw Error("Split tasks cannot introduce external dependencies");
    for (const dep of original.dependsOn)
      if (!t.dependsOn.includes(dep))
        throw Error("Each split task must preserve external dependencies");
  }
  const tasks = p.spec!.tasks.flatMap((t) =>
    t.id === original.id
      ? action.tasks
      : [
          {
            ...t,
            dependsOn: t.dependsOn.flatMap((id) =>
              id === original.id ? childIds : [id],
            ),
          },
        ],
  );
  return validateSpec(specSchema.parse({ ...p.spec!, tasks }), p);
}
export async function executeWithCoordinator(host: CoordinatorHost) {
  const p = host.project,
    state = stateFor(p);
  state.status = "executing";
  p.artifact ??= { files: [], scene: [], coverage: [], assets: [] };
  p.completedBuildTasks ??= [];
  for (let step = 0; step < 96; step++) {
    assertCurrent(host, state);
    const context = {
      coordination: {
        step: "decide",
        sharedContracts: state.outline?.sharedContracts,
        readyTasks: readyTasks(p),
        completedTasks: p.completedBuildTasks,
        workers: state.workers.slice(-16),
        remainingRepairs: Math.max(0, host.repairLimit - state.repairs),
        currentReview: state.reviewHash === bundleHash(p.artifact),
      },
      request: p.request,
      spec: p.spec,
      checks: p.checks,
      studioEvidence: p.studioEvidence,
      visualFeedback: p.visualEvidence
        ? {
            notes: p.visualEvidence.notes,
            reviewStatus: p.visualEvidence.reviewStatus,
            artifactHash: p.visualEvidence.artifactHash,
          }
        : undefined,
      artifactIndex: p.artifact.files.map((f) => ({
        path: f.path,
        kind: f.kind,
        characters: f.source.length,
      })),
      sceneIndex: p.artifact.scene.map((node) => ({
        path: node.path,
        className: node.className,
      })),
      instructions:
        "You are the game coordinator. Choose exactly one next action from observed state. Dynamically delegate a ready task to a temporary worker with a precise objective. Workers cannot spawn. Inspect existing source when a diagnosis is needed. Split an unstarted oversized task into smaller tasks while preserving every requirement and owned file and all external dependencies. Never reduce the approved game scope. Review when all tasks are built, then repair only current diagnosed failures within the remaining allowance. After repairs review again. Finish only with all tasks complete and a current passing independent static review. Finish means ready for Studio testing, NOT verified gameplay. Report blocked honestly if progress needs user input. Use existing receipts to avoid repeating successful work. Prefer actionable work to repeated inspections. Return a compact decision, never code or the whole plan.",
    };
    if (state.pendingDecision) {
      try {
        validateDecision(p, state, state.pendingDecision, host.repairLimit);
      } catch {
        state.pendingDecision = undefined;
      }
    }
    const action =
      state.pendingDecision ??
      (await host.request("planner", context, decisionSchema, (value) =>
        validateDecision(p, state, value, host.repairLimit),
      ));
    assertCurrent(host, state);
    if (!state.pendingDecision) {
      state.decisions++;
      (state.decisionHistory ??= []).push({
        at: new Date().toISOString(),
        action,
      });
    }
    state.pendingDecision = action;
    host.save(
      "Coordinator: " +
        action.action +
        ("taskId" in action ? " " + action.taskId : ""),
    );
    try {
      if (action.action === "blocked")
        throw Error("Coordinator needs input: " + action.reason);
      if (action.action === "finish") {
        p.stage = "ready_to_test";
        state.status = "ready_to_test";
        p.checks.push({
          id: "studio",
          status: "pending",
          detail:
            "Apply and run this artifact in Studio. Static review does not establish gameplay or visual quality.",
        });
        host.save(
          "Ready for Studio testing. All coordinator tasks and independent static review are complete.",
        );
        return;
      }
      if (action.action === "split") {
        const binding = p.proposalPlan?.tasks[action.taskId];
        if (binding)
          for (const task of action.tasks)
            task.proposalSections = [...binding.sections];
        p.spec = refinedSpec(p, action);
        if (binding) {
          delete p.proposalPlan!.tasks[action.taskId];
          for (const task of action.tasks)
            p.proposalPlan!.tasks[task.id] = {
              sections: [...binding.sections],
              scenePaths: [],
            };
        }
        state.reviewHash = undefined;
        host.save(
          "Coordinator split " +
            action.taskId +
            " into " +
            action.tasks.length +
            " workers without changing its requirements.",
        );
        continue;
      }
      if (action.action === "inspect") {
        const report = await worker(
          host,
          state,
          "inspection",
          action.objective,
          undefined,
          () =>
            host.request(
              "reviewer",
              {
                request: p.request,
                spec: p.spec,
                objective: action.objective,
                files: p.artifact!.files.filter((f) =>
                  action.paths.includes(f.path),
                ),
                checks: p.checks,
                instructions:
                  "Investigate only the supplied source and evidence. Cite exact supplied paths in each finding. Report uncertainty. Do not claim Studio execution, modify requirements or spawn agents. Your report is advice, not a passing acceptance review.",
              },
              inspectionSchema,
              (result) => {
                if (
                  result.findings.some((f) =>
                    f.paths.some((path) => !action.paths.includes(path)),
                  )
                )
                  throw Error("Inspection findings must cite supplied paths");
              },
            ),
        );
        state.workers.at(-1)!.findings = report.findings;
        host.save("Inspection findings saved for the coordinator.");
        continue;
      }
      const kind = action.action === "delegate" ? "build" : action.action;
      await worker(
        host,
        state,
        kind,
        action.objective,
        action.action === "delegate" ? action.taskId : undefined,
        (commit) =>
          host.execute(
            kind,
            action.objective,
            action.action === "delegate" ? action.taskId : undefined,
            action.action === "repair" ? action.paths : undefined,
            () => commit(undefined),
          ),
        () => {
          if (kind === "repair") state.repairs++;
          state.reviewHash =
            kind === "review" ? bundleHash(p.artifact!) : undefined;
        },
      );
      if (kind === "review") state.reviewHash = bundleHash(p.artifact!);
      else state.reviewHash = undefined;
      host.save("Coordinator received " + kind + " results.");
    } finally {
      state.pendingDecision = undefined;
      host.save("Coordinator decision recorded.");
    }
  }
  throw Error(
    "Coordinator reached its 96-decision run limit. Completed work is saved. Review the worker history before resuming.",
  );
}
