# Takko worker asset execution

## Purpose

The Butter Crunch benchmark exposed a product gap: an assistant searching and importing assets outside Takko would conceal the worker's missing capabilities. That assisted build was stopped. The replacement is an application-owned asset pipeline. No Butter Crunch game-quality score or successful native asset run is claimed by this implementation.

## Implemented path

1. The planner declares asset needs with their purpose, requirement, search query, constraints, placement and size. A builder can also discover a missing asset while implementing a task.
2. Takko starts its own installed Studio MCP executable and targets an explicitly selected Studio. It searches Creator Store through fixed tool contracts.
3. The configured builder route selects an actual returned candidate or requests another query. It cannot invent candidate IDs.
4. The adapter imports into an owned quarantine, rejects executable or unsupported content, checks bounds and loading, and creates a native preview.
5. The configured evaluator receives the actual Studio image or a recorded Studio-process WAV and structured observations. It evaluates suitability; it cannot build replacement assets or mutate Studio.
6. Takko places the candidate at the requested transform, captures it again, and evaluates the placed result. Rejection cleans up the owned candidate before another attempt.
7. Accepted candidates are serialized with acquisition records. Temporary native instances are released, and their exact exported content enters the generated project. The regular Studio bridge recreates imported MeshParts through `AssetService:CreateMeshPartAsync`; assigning the read-only `MeshId` property is not used.

These checks establish **asset-stage acceptance only**. Full-game apply, interactions, animation, audio, gameplay and performance still need native verification against the final artifact.

## Failure and escalation rules

- At most two searches and three candidate inspections per need in the production Engine configuration. Model calls use the existing charged budget.
- Asset decisions use only the first configured builder/evaluator routes. They do not silently fall through to stronger models. Bounded output-format corrections remain on that same route.
- An escalation request is recorded. With the current policy, escalation is disabled and the asset run fails; no Astra intervention is executed.
- Missing Studio, missing native evidence, unsuitable imports and exhausted attempts cannot pass as substituted procedural assets.
- Uncertain mutations, interrupted runs or failed cleanup block further project changes until reconciliation. Timed-out mutations are never blindly repeated.
- Acquisition results and error receipts are retained. Model-provided `retrieved` labels cannot authorize content. Modified or removed imported content cannot retain its earlier verification claim.
- Read-only discovery and offline tests are not native game verification.

## Current limits that must remain visible

| Capability | Current adapter behavior |
| --- | --- |
| Creator Store models / meshes | Bounded search, inspection, scoped import, placement and image evaluation implemented; native end-to-end verification is still pending. |
| Imported classes | Folder, Model, Part, MeshPart, Decal and Sound. Unsupported descendants cause rejection rather than silent omission. |
| Paid assets | Not purchased; unknown or nonzero prices are rejected. |
| Audio | App-owned Windows process-loopback capture and explicit audio evaluation are implemented for short sounds through audio-capable Gemini/OpenRouter models. Inspection and placement require separate recordings. Native helper isolation passed an owned-tone test; live Studio sound and paid semantic evaluation remain unrun. |
| Image import | Image search, scoped Decal preview, loaded-texture checks, visual evaluation, placement and export implemented; live Studio compatibility remains unverified. |
| Animation search | Unsupported by this adapter contract; required needs fail explicitly. |
| Generated asset backends | Not implemented by this change. |
| Final-game validation | Existing Studio acceptance remains required; successful asset acquisition is insufficient. |

This does not establish that Takko can complete Butter Crunch. Animation retrieval remains a capability gap; image and audio integration require live verification. See [image and audio evidence](takko-image-and-audio-evidence.md) for recording limits and provider requirements. Missing evidence still fails the run.

## Operating the implementation

Use the Build tab's **Assets → Find Studio for assets**, then explicitly choose the disposable test place. Configure provider credentials through Models. The test web instance uses `http://127.0.0.1:4324` and isolated storage `.forge/asset-loop-runtime`; it does not replace the desktop app's saved projects.

The actual app discovery receipt is [takko-asset-runtime-discovery.json](results/takko-asset-runtime-discovery.json). At capture time, no Studio was connected and no provider key was loaded. No generation, asset search or asset import call was made during that discovery check.

The earlier assistant-generated search files under `benchmarks/runs/butter-crunch-20260915/assets` are excluded from worker inputs and benchmark evidence. They are preserved only to make that distinction auditable.

## Implementation map

- `src/generation/asset-contract.ts`: needs, decisions, evaluations and durable run records.
- `src/generation/asset-pipeline.ts`: bounded state transitions, retry, cleanup and escalation rules.
- `src/generation/studio-mcp-client.ts`: owned stdio process, protocol, timeout and lifecycle.
- `src/generation/studio-asset-adapter.ts`: native tool templates, quarantine, captures and export.
- `src/generation/engine.ts`: planning/build integration, route selection and budget accounting.
- `src/generation/asset-provenance.ts`: server-retained acquisition authority.
- `src/web/AssetExecution.tsx`: Studio selection and visible run history.
- `src/benchmark/asset-execution.ts`: execution failures before and after artifact creation.

## Benchmark execution failures

Use `npm run benchmark -- asset-execution --project <saved-project.json> --out <new-report.json>` to inspect a retained run, including a run that produced no artifact. A failed, interrupted, unresolved or escalation-required run yields an explicit failed execution assessment, with no invented artifact hash or numeric quality score.

For an artifact-backed Takko submission, include `--asset-project <saved-project.json>` in the existing `score` command. It checks the exact artifact and case prompt binding before applying an execution failure veto. The usual evidence-file integrity checks remain required. Passing the asset stage does not award any native gameplay or quality gate.

Records retain frozen model configuration, project revision, input identity, run identity and error receipts. File hashes establish record identity, not whether a record came from production; offline fixtures remain identified as tests.

Initial asset-loop `npm run check` passed 451 unit/API tests; its [historical verification record](results/takko-asset-loop-verification.json) is preserved. The image/audio extension passed 549 unit/API tests, 10 desktop checks, 36 browser tests, Luau compilation and behavior checks, 14 plugin scenarios with mocked Studio APIs, guard evaluation, production build and HTTP smoke. See [current verification record](results/takko-image-audio-verification.json). Mocked protocol, plugin and Engine tests do not establish live Creator Store compatibility or perceptual quality.
