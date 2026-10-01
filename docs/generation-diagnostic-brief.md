# Generation diagnostic brief

Written 2026-10-01 for a fresh agent asked to diagnose why Takko generation keeps failing and what to fix. Source commit at writing: `abad08e`. Facts below were read from code, result records and the installed build on that date. Anything not verified is marked as such.

**Result so far:** about $18 has been spent on this OpenRouter key and Takko has never produced a playable game. The two newest paid probes, run from scripts and not through the app, are the first to complete. A real review finished and parsed. The builder submitted four compiling files that passed 18 of 20 contract tests. Native gameplay is still unverified.

## Rules before you touch anything

Read `AGENTS.md` and `research/notes/continuation.md` first. They override this brief.

- No paid model call without the user's explicit authorization for that specific run. No automatic retries.
- Never stop, restart or replace the running Takko app without asking. The live service PIDs are in `continuation.md`.
- Never print, log or copy the provider key. It lives in a DPAPI vault under `%APPDATA%/Forge Desktop`.
- `research/evidence/` and `docs/results/` are preserved records. Do not edit original failure records.
- Studio work only in the throwaway place `TrialReviewInspection.rbxlx`, cleaned up afterwards.
- The Claude Code sandbox on this machine cannot see `%APPDATA%/Forge Desktop`, and its safety check blocks paid scripts. Paid probes have to be run by the user or by another agent with access.

## What Takko is

A local Electron desktop app (`release/Takko-win32-x64/Takko.exe`) with a bundled Node service. The user describes a Roblox game in chat, answers questions, picks Marketplace assets, approves a proposal, and Takko generates Luau, scene data and an exported `.rbxlx`. It talks to Roblox Studio through StudioMCP and the plugin `plugin/Forge.plugin.luau`, building only inside its own namespace. By design it stops at **ready to test**, not at "verified game".

The demo the user wants is small: an R6 player punches a static straw dummy using the "infinity punches" clip from pack `15008746676` as a click-driven 13-hit combo. The dummy is asset `10161087974`.

## Three versions exist. Know which one ran

| Version | Location | Contains |
|---|---|---|
| Installed app | `release/Takko-win32-x64` (`service.cjs` built 2026-09-30 00:56 local) | Direct build and the discovery-ID fix. **Not** the Release A role evidence (`ROLE_CAPTURE_VERSION` absent) and **not** the builder policy (`openCodeCall` absent). |
| Staged candidate | `.forge/update-stage/app/Takko-win32-x64` (built 2026-09-30 21:14) | Release A role evidence, protected review budget, service lease fix. **Not** the builder policy from `d2ac499` or the pack fixes. Not installed. |
| Source | `HEAD` (`abad08e`) | Everything, including the builder policy. |

Any run through the user's app UI today would use the installed build and miss most fixes below. The 10-01 probes ran from `scripts/trial-probe-*.ts` against source.

## Models and rates

- **Active preset `son`:** `anthropic/claude-sonnet-5.5` through OpenRouter for every route: planner, builder, reviewer and repair.
- **Rates in the stored profile and the OpenRouter catalog, checked 2026-09-30:** $2/M input, $10/M output, $0.20/M cache reads and $2.50/M five-minute cache writes.
- **Preset `maxOutputTokens` is 8,192 with no reasoning effort set.** So the provider default effort applies, which the catalog reports as high. Reasoning tokens share the output cap and are billed as output.
- **Host overrides:**
  - Final review: 32,768 output tokens, medium effort, one attempt, no fallback (`src/generation/review-budget.ts`, `trialFinalReviewPolicy`). In staged and source only.
  - OpenCode coding and repair calls: 32,768 output tokens, medium effort. An explicit profile effort is kept (`src/generation/opencode-gateway.ts`, `defaultOpenCodeCallPolicy`, commit `d2ac499`). Source only.
- **Other configured models:** the user has five model profiles and three presets in total. They were not enumerated for this brief because the sandbox cannot read the settings file. `typesafe/jev-1.13` ("Jev", `src/generation/decisions.ts`) is a bounded non-coding decision model and is refused for coding. Historical runs used `anthropic/claude-sonnet-5` before 5.5.
- **Coding runtime:** OpenCode 1.18.31, pinned and bundled, driven through a host-owned gateway. Rojo converter and Luau compiler are bundled with hash checks.

## Generation pipeline (current source)

Stage values (`src/generation/schema.ts`): `draft, planning, clarification, review, generating, repairing, ready_to_test, verified, failed, interrupted, needs_input`. Model phases: `research, planner, builder, reviewer, repair`. All model calls go through `Engine.call` in `src/generation/engine.ts` (4,264 lines), except OpenCode traffic, which goes through `OpenCodeGateway`.

1. **Conversation and proposal (paid, planner route).** Concept shaping, clarifying questions (`suggestProposalQuestions`), proposal drafting and edits. Output is a saved proposal with mechanics, theme, environment and asset needs.
2. **Asset discovery and picking (mostly free).**
   - Creator Store search runs through the Studio adapter (`src/generation/studio-asset-adapter.ts`, `src/marketplace/*`).
   - Native inspection snapshots each asset. `src/marketplace/inspection.ts` is a security scan only.
   - Role evidence covers nine roles and checks animation clips for rig, duration and pose digest (`role-evidence.ts`, `role-capture.ts`). Staged and source only.
   - Attached scripts get a **paid** source review: the reviewer route classifies each script as keep, disable or danger (`engine.ts` around line 2681).
   - Users can attach assets in chat, replace them or skip them. Attack clips need explicit timing acceptance.
3. **Approval to spec, with no planning model.** `directBuildSpec` (`src/generation/direct-build.ts`, commit `984d686`) turns the approved proposal into one task called `implementation`. The old path used a planning worker that split work into many tasks, and most early failures happened there.
4. **Asset acquisition (native, with some paid calls).** `resolveAssets` calls `runAssetPipeline` (`src/generation/asset-pipeline.ts`). It imports picks into the Studio namespace, captures and compares components, converts through Rojo and records provenance. Its model hooks make paid builder and reviewer calls for adaptation, decisions and evaluation (`engine.ts` lines 782 to 960).
5. **Coding (paid, one OpenCode session).** `runOpenCode` offers three tools: `manifest`, `task_context` and `submit_task`. `submit_task` validates file ownership, scene, physics, asset provenance and coverage, compiles, then saves a checkpoint. Invalid patches return validation feedback to the model.
6. **Final review (paid, one call).** The whole-game reviewer returns issues and acceptance tests, which must compile.
7. **Repair (paid).** Runs up to the configured `repairLimit`. Trials used 0. The current preset value was not re-read for this brief.
8. **Checks and export.** Static path checks, then `.rbxlx` export and a structural XML check, then `ready_to_test`. Export returns HTTP 409 while review checks are failing.

**Budget guards, all in source:**
- project cap and generation cap,
- a per-request reservation of `(request bytes + 1024) × input rate + max output × output rate`,
- a protected final-review allowance that coding cannot spend,
- a no-code stop at min($0.50, cap/4),
- refusal while any billing is unknown,
- 48 OpenCode requests per session and a 2 MB request limit.

## Money

Key balance at 2026-10-01T03:26:03Z: **$12.01960953 remaining, $17.98039047 used, $30 limit**.

| Bucket | USD |
|---|---:|
| Attempts that produced **no game code** (planning, asset or truncation failures, including probe 1) | 7.52 |
| Attempts that produced code but **failed review or export** | 6.57 |
| Proposal and edit chains with no build | 0.39 |
| Probes 2 (review $0.23, scoped build $0.25) | 0.48 |
| **Itemized in result records** | **14.95** |
| Key usage not itemized here (earlier work before 2026-09-24, not reconciled for this brief) | about 3.03 |

The single largest loss was $3.48 (`runtime-diagnostics-20260927`). Coding finished, then the reviewer used all 32,768 output tokens, 28,793 of them reasoning, and truncated. No export followed.

## Failure history by class

Per-attempt detail is in `docs/results/trial-failure-diagnosis/PLAN.md` (attempt inventory) and each `docs/results/*/RESULTS.md`.

| Class | Examples | Spent | Status |
|---|---|---:|---|
| Planning-worker contract failures | Missing theme coverage, enum/JSON errors, task self-edge, more than 40 merged requirements, duplicate approved-group binding, query policy | 4.85 | The direct build removes the planning worker. Saved inputs replay offline. Not proven live through the app. |
| Asset selection and acquisition | Auto-selection picked 0 of 3 and 0 of 4, animation acquisition rejected, pack over 3,000 nodes, discovery ID `proposal-<uuid>` rejected by the real binder, missing source reviews and contained sound | 1.86 | The ID fix is installed. Role evidence and large-pack selection are staged or source only. Marketplace search rarely returns animations. |
| Output-limit truncation | Reviewer truncated at 32,768. Builder used all 8,192 tokens on reasoning and called no tool (probe 1) | 3.59 | Reviewer policy is staged. Builder policy is source only. Probes 2 completed under both. |
| Review gate failures, export 409 | Three reviewer failures blocked export | 1.25 | Open. Depends on model output quality. |
| Export structural defect | Exported XML lacked the generated `Imported` lookup | 1.84 | Caught by the structural check. A derived golden exists. |
| Billing and gateway | Unknown-billing hold refused OpenCode requests, OpenRouter 429 "could not verify credits" | 0.69 | Refusal is by design. The 429 was provider-side. |
| Test harness and mocks | Doubles hid real-boundary checks, packaging lacked `luau-ast` and Rojo, Studio `user_mouse_input` failed | $0 | Packaging fixed. A $0 real-boundary rehearsal exists (`scripts/rehearsal-*`). Input tool still broken. |
| App runtime | Service died on wake from sleep, a lease race. `models.json` ENOENT seen by two shells, not reproducible later | $0 | Lease fix staged only. ENOENT unexplained. |

Recurring pattern: almost every paid attempt stopped at a **different** gate, often one of Takko's own validators or contracts, not at the model writing bad game code. Offline tests passed each time because the failing boundary was mocked. Each fix then needed new approval, so progress came about one stage per paid run.

## Latest measured results (probes 2, 2026-10-01)

Record: `docs/results/trial-probes/RESULTS.md`, folders `p-review-2/` and `p-build-2/`.

- **Review:** one call on the historical golden. 91,627 input and 4,596 output tokens, finish reason stop, parsed and host-valid, $0.229.
- **Scoped build** (combo only, original assets): 3 calls, 35,963 input and 19,868 output tokens (8,394 reasoning), $0.254. The main call used 19,182 output tokens, which would have failed under the old 8,192 limit. It produced four files (ComboConfig, Combo, ComboServer, ComboClient). All compile and pass the AST checks.
- **Contract tests on the unmodified code: 18 of 20.**
  - All 13 segments, buffering, nonce, replay, order and end-of-combo reset passed.
  - One failure is the test's own mistake: it reads `pending.hitAt` after the model cleared it.
  - One is a real spec deviation: the model adds `lateSlack = 0.15` to the 0.35 s grace window. The user has not decided whether to accept it.
- **Native Play:** setup worked, but the first `user_mouse_input` request failed in the Studio bridge. No playback evidence.

## Open issues, roughly by impact

1. **The installed app lacks most fixes**, including the builder policy, role evidence, protected review budget, pack fixes and the lease fix. Installing needs the user's restart approval.
2. **No complete demo build has run on the current direct path.** Only a scoped combo has been measured. World setup, dummy placement and integration are unmeasured. The current estimate is $0.50 to $0.90 with a suggested $1.50 cap. That is an inference from probes 2. An earlier $7.50 figure came from the obsolete 30-call pipeline and should be ignored.
3. **Native gameplay has never been verified.** The Studio input tool fails. A human play-test in the throwaway place costs $0 and may be the fastest evidence.
4. **Asset generality is unproven.** Pre-registered sweeps found zero false-ready results across 22 to 27 comparisons. But 11 of 16 strata went unfilled, because Creator Store search returns few animations (`studio-asset-adapter.ts`: "Official Creator Store search does not support Animation"). The animation sourcing strategy itself may need rethinking: attachments, inventory or a curated library.
5. **Pipeline complexity.** There are many strict validators across a 4,264-line engine and a 1,663-line asset pipeline. Most historical stops were self-inflicted gate failures. Whether each gate earns its place is an open question.
6. **Unknown billing holds** can block later OpenCode requests in the same project (`opencode-gateway.ts`, "Unknown provider billing must be reconciled"). One $0.749 conservative hold sits in an isolated probe project only.

## Verified versus not

- **Verified offline:** `npm run check` passed on `d2ac499` and `abad08e`, with 1,889 unit tests, 108 browser and 10 Electron tests. These use mocks and doubles.
- **Verified natively at $0:**
  - The staged app's rehearsal reached `ready_to_test` on a historical golden with a scripted model.
  - The current picks pass native acquisition.
  - Role sweeps recorded their results.
- **Verified with real models:** review completion on a golden, and the scoped combo code described above.
- **Never verified:**
  - a complete generated game from the current pipeline,
  - native combo playback,
  - multiplayer behavior,
  - a generated game working when published.

## Questions worth answering

- What is the minimum set of gates that keeps safety and budget intact while letting a small demo finish?
- Can the scoped probe's four files plus the two picks already form the demo, testable by a human at $0?
- Which gates in the direct path still have only mocked coverage? Check `tests/chat-journey-fixture.ts:79` and related files.
- Is per-run cost dominated by build sessions, context size, review or asset-stage calls? Measure on one complete small build.
- Should animations come from user attachments or a library instead of search?

## Key files

| Area | Files |
|---|---|
| Engine, phases, budgets | `src/generation/engine.ts`, `schema.ts`, `review-budget.ts`, `direct-build.ts` |
| OpenCode | `src/generation/opencode-runtime.ts`, `opencode-gateway.ts` |
| Assets | `src/generation/asset-pipeline.ts`, `studio-asset-adapter.ts`, `src/marketplace/` |
| Providers | `src/generation/providers.ts`, `settings.ts`, `decisions.ts` |
| Desktop | `desktop/main.mjs`, `desktop/supervisor.mjs`, `desktop/service.ts`, `docs/desktop.md` |
| Probes and rehearsal | `scripts/trial-probe-review.ts`, `trial-probe-build.ts`, `trial-probe-native.ts`, `rehearsal-*` |
| Records | `docs/results/trial-failure-diagnosis/PLAN.md`, `docs/results/trial-probes/RESULTS.md`, `docs/results/generalization/RESULTS.md`, `research/notes/continuation.md` |
