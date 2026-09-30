// Explicit $0 structural replay in the approved Edit-only throwaway Studio.
// Original saved projects, live app, and provider credentials are never opened.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { withRehearsalPackage } from "./rehearsal-package";
import { derivedGolden, inspectExport } from "./rehearsal-golden";
import { rehearsalKey } from "../desktop/rehearsal";
import { GenerationStore } from "../src/generation/store";
import { refreshProposal } from "../src/generation/proposal";
import {
  importProposalPicks,
  projectProposalPicks,
} from "../src/marketplace/proposal-picks";
import { requestedRig } from "../src/generation/rig-policy";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { unpackMarketplace } from "../src/marketplace/studio";
import { isVerifiedEditState } from "../src/generation/studio-state";
import type { Project } from "../src/generation/schema";
import { projectComponents } from "../src/generation/component-integration";

const studioId = "360d3ed1-0d29-4942-96ed-1bb8e5faea62";
const { original, bundle, changes } = derivedGolden();
const trialPreflight = process.argv.includes("--trial-preflight");
const injectCleanupFault = process.argv.includes("--fault-after-acquisition");
assert.ok(!injectCleanupFault || trialPreflight, "Cleanup fault is limited to acquisition-only rehearsals");
// Current scene policy rejects the historical, unrequested enclosure. Preserve
// the minimal golden separately and record this replay-only scene delta.
bundle.scene = bundle.scene.filter(
  (n) => !/\/World\/(Ceiling|Walls)(\/|$)/.test(n.path),
);
const capturedSources: string[] = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/asset-roles/golden-source-review.json",
    "utf8",
  ),
).assets.flatMap((r: any) => r.scripts.map((s: any) => s.source));
const p: Project = trialPreflight
  ? JSON.parse(
      fs.readFileSync(
        "docs/results/direct-build-acceptance/terminal-project.json",
        "utf8",
      ),
    )
  : structuredClone(original);
if (trialPreflight) {
  const draft = JSON.parse(
    fs.readFileSync(
      "docs/results/trial-failure-diagnosis/trial-proposal.json",
      "utf8",
    ),
  );
  const picks = new Map(p.proposal!.assetNeeds!.map((n) => [n.id, n.pick]));
  p.proposal = { ...p.proposal!, ...draft.proposal };
  for (const need of p.proposal!.assetNeeds!) need.pick = picks.get(need.id);
  p.proposal!.assetNeeds!.find(
    (n) => n.id === "punch_animation",
  )!.pick!.clipKey = draft.selectedClip.key;
}
p.id = randomUUID(); // Keep historical source namespace, only in the isolated empty Studio.
p.charges = [];
p.events = [];
p.reservedMicros = 0;
p.budgetMicros = 7500000;
p.artifact = null;
p.review = null;
p.checks = [];
p.jobId = null;
p.error = null;
p.stage = "review";
p.assetPipeline = null;
p.assetPipelineHistory = [];
p.completedBuildTasks = [];
delete p.coordination;
delete p.protectedReview;
delete p.generation;
delete p.proposalPlan;
p.assetStudioId = studioId;
p.rig = requestedRig(trialPreflight ? "R6" : "R15");
p.assetDiscovery!.studioId = studioId;
p.assetDiscovery!.approved = false;
importProposalPicks(p);
projectProposalPicks(p);
refreshProposal(p);
// Explicit current-producer compatibility, separate from the two-line golden.
bundle.files.find((f) =>
  f.path.endsWith("PunchController.client.luau"),
)!.source = bundle.files
  .find((f) => f.path.endsWith("PunchController.client.luau"))!
  .source.replace(
    "local current: Instance = Workspace",
    "local current: Instance = ReplicatedStorage",
  );
bundle.retainedPhysics = [
  {
    needId: "dummy",
    mode: "anchor_all",
    reason:
      "Preserve the stationary dummy intent and DummySetup anchoring in the exported copy before execution.",
  },
];

const native = new StdioStudioClient({ timeoutMs: 120000 });
const state = () =>
  native
    .callTool("get_studio_state", { studio_id: studioId })
    .then(unpackMarketplace);
const census = () =>
  native
    .callTool("execute_luau", {
      studio_id: studioId,
      datamodel_type: "Edit",
      code: `local scripts=0 local owned={} for _,s in ipairs(game:GetChildren()) do local r=s:FindFirstChild(${JSON.stringify(p.scope)}) if r then table.insert(owned,r:GetFullName()) end end for _,n in ipairs(game:GetDescendants()) do if n:IsA("LuaSourceContainer") then scripts+=1 end end return {scripts=scripts,owned=owned,workspaceChildren=#workspace:GetChildren()}`,
    })
    .then(unpackMarketplace);
const before = await state();
assert.ok(isVerifiedEditState(before));
const beforeCensus = await census();
assert.equal(beforeCensus.scripts, 0);
assert.deepEqual(beforeCensus.owned, []);
let calls = 0;
let evidenceDirectory: string | undefined;
let manifest: any, taskContext: any;
const savedTasks = new Set<string>();
const pages = new Map<string, { total: number; chunks: Map<number, string> }>();
let nextPage: { reference: string; offset: number } | undefined;
const toolResults = (request: any) => {
  nextPage = undefined;
  for (const message of request.messages ?? [])
    if (message.role === "tool") {
      const value =
        typeof message.content === "string"
          ? message.content
          : message.content?.map((c: any) => c.text ?? "").join("");
      try {
        let output = JSON.parse(value);
        if (
          output.reference &&
          typeof output.offset === "number" &&
          typeof output.text === "string"
        ) {
          const record = pages.get(output.reference) ?? {
            total: output.totalCharacters,
            chunks: new Map<number, string>(),
          };
          record.chunks.set(output.offset, output.text);
          pages.set(output.reference, record);
          let joined = "";
          while (record.chunks.has(joined.length))
            joined += record.chunks.get(joined.length)!;
          if (joined.length < record.total) {
            nextPage = { reference: output.reference, offset: joined.length };
            continue;
          }
          output = JSON.parse(joined);
        }
        if (output.spec && output.namespace) manifest = output;
        if (output.task && output.existingProject) taskContext = output;
        if (
          typeof output.saved === "string" &&
          Array.isArray(output.completedBuildTasks)
        )
          savedTasks.add(output.saved);
      } catch {
        throw Error(
          "Host tool rejected the offline fixture: " +
            String(value).slice(0, 1200),
        );
      }
    }
};
function completion(request: any, content: any, tool?: string, args?: unknown) {
  const name = tool
    ? request.tools?.find((t: any) => t.function?.name === "takko_" + tool)
        ?.function.name
    : undefined;
  if (tool) assert.ok(name, "Missing real host tool " + tool);
  const message: any = tool
    ? {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "rehearsal_" + calls,
            type: "function",
            function: { name, arguments: JSON.stringify(args) },
          },
        ],
      }
    : {
        role: "assistant",
        content:
          typeof content === "string" ? content : JSON.stringify(content),
      };
  const base = { id: "offline-" + calls, model: request.model, created: 1 },
    usage = { prompt_tokens: 0, completion_tokens: 0, cost: 0 };
  if (!request.stream)
    return Response.json({
      ...base,
      object: "chat.completion",
      choices: [
        { index: 0, message, finish_reason: tool ? "tool_calls" : "stop" },
      ],
      usage,
    });
  const delta = tool
    ? {
        ...message,
        tool_calls: message.tool_calls.map((t: any, index: number) => ({
          index,
          ...t,
        })),
      }
    : message;
  return new Response(
    [
      {
        ...base,
        object: "chat.completion.chunk",
        choices: [{ index: 0, delta, finish_reason: null }],
      },
      {
        ...base,
        object: "chat.completion.chunk",
        choices: [
          { index: 0, delta: {}, finish_reason: tool ? "tool_calls" : "stop" },
        ],
        usage,
      },
    ]
      .map((c) => "data: " + JSON.stringify(c) + "\n\n")
      .join("") + "data: [DONE]\n\n",
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
try {
  const result = await withRehearsalPackage(
    trialPreflight ? "native-trial-preflight" : "native-golden",
    async (input, directory) => {
      calls++;
      assert.ok(calls <= 48, "Bounded offline replay exhausted");
      const request = JSON.parse(input.body);
      if (new URL(input.url).pathname === "/api/alpha/decisions") {
        const evidence = request.state;
        assert.ok(
          evidence.sources?.every((s: any) => typeof s.source === "string"),
        );
        // The historical dummy's respawn loop and animation pack's author note
        // are not needed by the golden integration. No script is run here.
        assert.ok(
          evidence.sources.every((s: any) =>
            capturedSources.includes(s.source),
          ),
          "Unreviewed source changed",
        );
        return Response.json({
          model: request.model,
          answers: Object.fromEntries(
            Object.keys(request.questions).map((k) => [
              k,
              { type: "choice", choice: "disable" },
            ]),
          ),
          usage: { input_tokens: 0, output_tokens: 0, cost: 0 },
        });
      }
      assert.equal(new URL(input.url).pathname, "/api/v1/chat/completions");
      if (request.tools?.length) {
        if (trialPreflight)
          return completion(
            request,
            "Acquisition-only rehearsal deliberately stops before game source generation. No gameplay or whole-game export claim.",
          );
        toolResults(request);
        if (nextPage) return completion(request, null, "read_output", nextPage);
        if (!manifest) return completion(request, null, "manifest", {});
        if (!taskContext)
          return completion(request, null, "task_context", {
            taskId: manifest.spec.tasks[0].id,
          });
        if (savedTasks.has(taskContext.task.id))
          return completion(
            request,
            "Offline structural replay submissions complete. Native gameplay is untested.",
          );
        const patch = {
          ...bundle,
          // The Engine already retains this run's actual acquisition records.
          // Never overwrite them with historical record identities from the golden.
          assets: [],
          coverage: taskContext.task.requirements.map((id: string) => ({
            requirementId: id,
            status: "implemented",
            detail:
              "Offline transport replays the preserved source with explicit compatibility changes. Structural checks, not gameplay verification.",
            files: bundle.files.map((f) => f.path),
          })),
        };
        fs.writeFileSync(
          path.join(directory, "submitted-bundle.json"),
          JSON.stringify(patch, null, 2),
        );
        return completion(request, null, "submit_task", {
          taskId: taskContext.task.id,
          patch,
        });
      }
      // Keep first unknown contract as a failure with its real request intact.
      const user = request.messages.find((m: any) => m.role === "user");
      const content =
        typeof user?.content === "string"
          ? user.content
          : user?.content?.find((c: any) => c.type === "text")?.text;
      const context = JSON.parse(content);
      if (context.kind === "attached-source-review") {
        assert.ok(
          context.sources.every((s: any) => capturedSources.includes(s.source)),
          "Unreviewed source changed",
        );
        return completion(request, {
          scripts: context.sources.map((s: any) => ({
            name: s.name,
            action: "disable",
          })),
        });
      }
      if (context.task === "component-source-review") {
        const { evidence, requirementIds } = context.context;
        assert.ok(
          evidence.sourceBodies.every((s: any) =>
            capturedSources.some(
              (source) =>
                createHash("sha256").update(source).digest("hex") === s.sha256,
            ),
          ),
          "Unreviewed component source changed",
        );
        assert.deepEqual(
          evidence.removedCapabilities,
          [],
          "New permission changes require review",
        );
        return completion(request, {
          packetHash: evidence.packetHash,
          inputHash: evidence.inputHash,
          disposition: "integration_candidate",
          reason:
            "Offline reviewed fixture: retained dummy geometry or selected raw clip is reusable. Integration and native gameplay verification remain required.",
          serializedMedia: (evidence.contentReferences ?? []).map((r: any) => ({
            index: r.index,
            property: r.property,
            value: r.value,
            purpose:
              "Preserved asset reference. Availability and rendering are not verified by this replay.",
            verification: "unverified",
          })),
          sources: evidence.sourceBodies.map((s: any) => ({
            sha256: s.sha256,
            behavior: s.numberedSource.includes("robo=")
              ? "Clones its own model and restores it after Humanoid death. The independent picker source review disables this unneeded respawn behavior in delivery."
              : "Author comments only, with no executable behavior.",
            reuse: "preserve",
            dependencies: s.numberedSource.includes("robo=")
              ? [
                  {
                    kind: "instance_reference",
                    value: "Parent model Humanoid Health",
                    sourceLines: { start: 4, end: 4 },
                    verification: "unverified",
                  },
                ]
              : [],
            unresolved: [],
          })),
          requirements: requirementIds.map((id: string) => ({
            requirementId: id,
            status: "integration_needed",
            reason:
              "Retained structure supplies only the selected component. Game source must implement input, hits and feedback.",
            sourceHashes: [],
            nodeIndices: [evidence.nodes[0].index],
          })),
          permissionImpacts: [],
          integrationNotes: [
            "Offline transport fixture, not an independent model judgement or native gameplay pass.",
          ],
          runtimeVerification: "not_performed",
        });
      }
      if (context.task === "asset-evaluation") {
        assert.equal(context.context.need.kind, "Audio");
        return completion(request, {
          accepted: false,
          visualFit: false,
          functionalFit: false,
          audioFit: false,
          reason:
            "Offline metadata-only replay has no listening judgement. Preserve the historical unresolved sound rather than claiming audible fit.",
        });
      }
      if (context.task === "asset-selection") {
        assert.equal(
          context.context.candidates.length,
          0,
          "Do not silently replace the approved reference",
        );
        return completion(request, {
          action: "reject",
          candidateId: null,
          query: null,
          reason:
            "The approved audio remains unverified. No replacement is authorized in this structural replay.",
        });
      }
      if (context.artifact && context.spec) {
        assert.equal(request.max_tokens, 32768);
        assert.equal(request.reasoning?.effort, "medium");
        const aliases: Record<string, string> = {
          punch_loop: "approved_0",
          theme_presentation: "approved_2",
          hit_counter_ui: "hit_counter",
          hit_detection_server: "approved_1",
          punch_cooldown: "approved_1",
          environment_room: "approved_3",
          multiplayer_lifecycle: "approved_0",
        };
        const tests = original.review!.tests.map((t) => ({
          ...t,
          requirementId: aliases[t.requirementId] ?? t.requirementId,
          source:
            t.requirementId === "punch_animation"
              ? t.source.replace(
                  'game:GetService("Workspace")',
                  'game:GetService("ReplicatedStorage")',
                )
              : t.source,
        }));
        // The two approved answers preserve the existing single-punch/cooldown
        // limits. Retain the actual original assertions as executable scenarios.
        for (const id of ["approved_4", "approved_5"]) {
          const test = tests.find(
            (t) => t.id === "test_punch_cooldown_configured",
          )!;
          tests.push({
            ...test,
            id: "preserved_limit_" + id,
            requirementId: id,
          });
        }
        assert.ok(
          context.spec.requirements.every((r: any) =>
            tests.some((t) => t.requirementId === r.id),
          ),
          "New required scenario lacks a reviewed replay test",
        );
        return completion(request, {
          tests,
          issues: original.review!.issues.map((issue) => ({
            ...issue,
            requirementId: aliases[issue.requirementId] ?? issue.requirementId,
          })),
        });
      }
      throw Error(
        "Unimplemented offline model response. Inspect actual requests.json before adding its reviewed fixture.",
      );
    },
    async ({ directory, request }) => {
      fs.writeFileSync(
        path.join(directory, "golden-diff.json"),
        JSON.stringify(
          {
            importedLookupChanges: changes,
            compatibility: [
              "Raw animation lookup begins at ReplicatedStorage under integration v2",
              "Host anchors stationary retained dummy before execution",
              "Remove historical unrequested ceiling and four walls under current scene policy",
            ],
          },
          null,
          2,
        ),
      );
      fs.writeFileSync(
        path.join(directory, "native-before.json"),
        JSON.stringify({ state: before, census: beforeCensus }, null, 2),
      );
      const id = randomUUID(),
        decisionId = randomUUID();
      const profile = {
        id,
        name: "Offline Sonnet",
        provider: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        model: "anthropic/claude-sonnet-5.5",
        inputRate: 2,
        outputRate: 10,
        maxOutputTokens: 8192,
      };
      await request(
        "/api/models",
        {
          profiles: [
            profile,
            {
              ...profile,
              id: decisionId,
              name: "Offline Jev",
              model: "typesafe/jev-1.13",
              inputRate: 0.042,
              outputRate: 0,
            },
          ],
          routes: {
            planner: [id],
            builder: [id],
            reviewer: [id],
            repair: [id],
            decisions: [decisionId],
          },
          budgetMicros: 7500000,
          generationBudgetMicros: 7500000,
          repairLimit: 0,
        },
        "PUT",
      );
      for (const keyId of [id, decisionId])
        await request(`/api/models/${keyId}/key`, { key: rehearsalKey }, "PUT");
      let current = await request(`/api/projects/${p.id}/asset-picks`, {
        revision: p.revision,
        studioId,
      });
      fs.writeFileSync(
        path.join(directory, "preflight-project.json"),
        JSON.stringify(current, null, 2),
      );
      current = await request(`/api/projects/${p.id}/approve-proposal`, {
        revision: current.revision,
        hash: current.proposal.hash,
        generationBudgetMicros: 7500000,
      });
      const deadline = Date.now() + 600000;
      while (current.jobId && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        current = await request(`/api/projects/${p.id}`);
      }
      fs.writeFileSync(
        path.join(directory, "terminal-project.json"),
        JSON.stringify(current, null, 2),
      );
      if (trialPreflight) {
        assert.equal(
          current.assetPipeline?.status,
          "passed",
          current.error ?? "Native acquisition did not pass",
        );
        const components = projectComponents(
          current,
          path.join(directory, "projects", "asset-evidence", current.id),
        );
        assert.equal(components.length, 2);
        const exported = components.map((c) => {
          const nodes = inspectExport(c.xml.xml);
          fs.writeFileSync(
            path.join(directory, c.reference.needId + ".rbxmx"),
            c.xml.xml,
          );
          if (c.reference.needId === "punch_animation")
            assert.ok(nodes.some((n) => n.className === "KeyframeSequence"));
          else
            assert.ok(
              nodes.some((n) =>
                ["Part", "MeshPart", "UnionOperation"].includes(n.className),
              ),
            );
          return {
            needId: c.reference.needId,
            nodes: nodes.length,
            reference: c.reference,
          };
        });
        assert.equal(
          current.charges.reduce((s: number, c: any) => s + c.chargedMicros, 0),
          0,
        );
        if (injectCleanupFault) throw Error("Injected failure after native acquisition and component export");
        return {
          calls,
          realProviderCalls: 0,
          cost: 0,
          acquisition: "passed",
          exported,
          gameBuild: "intentionally_not_performed",
        };
      }
      assert.equal(
        current.stage,
        "ready_to_test",
        JSON.stringify({ error: current.error, checks: current.checks }),
      );
      const xml = await request(`/api/projects/${p.id}/export`);
      fs.writeFileSync(path.join(directory, "game.rbxlx"), xml);
      const nodes = inspectExport(xml);
      for (const file of bundle.files)
        assert.equal(nodes.filter(n => n.source === file.source).length, 1, file.path + " source differs from the actual export");
      assert.ok(
        nodes.some(
          (n) =>
            n.className === "KeyframeSequence" &&
            n.path.startsWith("ReplicatedStorage/"),
        ),
      );
      assert.ok(
        nodes.some(
          (n) =>
            n.className === "Model" &&
            n.path.endsWith("/dummy/dummy/Training Dummy"),
        ),
      );
      assert.equal(
        current.charges.reduce(
          (sum: number, c: any) => sum + c.chargedMicros,
          0,
        ),
        0,
      );
      return {
        calls,
        realProviderCalls: 0,
        cost: 0,
        state: current.stage,
        nodes: nodes.length,
        checks: current.checks,
        protectedReview: current.protectedReview,
      };
    },
    (directory) => {
      evidenceDirectory = directory;
      new GenerationStore(path.join(directory, "projects")).save(p);
    },
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  // The precondition proved no such scope existed. Delete exactly this owned
  // namespace, without touching the original Studio or unrelated descendants.
  try {
    const finalState = await state();
    assert.ok(isVerifiedEditState(finalState));
    await native.callTool("execute_luau", {
      studio_id: studioId,
      datamodel_type: "Edit",
      code: `for _,s in ipairs(game:GetChildren()) do local r=s:FindFirstChild(${JSON.stringify(p.scope)}) if r then for _,n in ipairs(r:GetDescendants()) do if n:IsA("Sound") then n.PlayOnRemove=false n:Stop() end end r:Destroy() end end return true`,
    });
    const after = await census();
    console.log("Native cleanup", JSON.stringify(after));
    if (evidenceDirectory)
      fs.writeFileSync(
        path.join(evidenceDirectory, "native-after.json"),
        JSON.stringify({ state: finalState, census: after }, null, 2),
      );
    assert.deepEqual(after, beforeCensus);
  } finally {
    await native.close();
  }
}
