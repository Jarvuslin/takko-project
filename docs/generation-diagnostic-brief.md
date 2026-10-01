# Generation diagnostic brief

Written 2026-10-01 for a fresh agent asked to diagnose why Takko generation keeps failing and what to fix. Source commit at writing: `abad08e`. Facts below were read from code, result records and the installed build on that date. Anything not verified is marked as such.

**Result so far:** about $18 has been spent on this OpenRouter key and Takko has never produced a playable game. The two newest paid probes, run from scripts and not through the app, are the first to complete. A real review finished and parsed. The builder submitted four compiling files that passed 18 of 20 contract tests. Native gameplay is still unverified.

## Independent diagnosis, 2026-10-01

### Revised proposal: general generation, with combat as a regression case

The user clarified that the solution must serve arbitrary game requests, not only combat. This supersedes the narrow assembly path as the overarching recommendation. The combat proposal below remains an optional supported optimization and a first regression case, not a genre whitelist or a replacement for generation.

Use one host-controlled workflow across genres: approved behavior requirements -> native asset facts -> required integration work -> bounded generation of missing behavior -> compile/contract/export checks -> targeted repair of concrete failures -> Studio acceptance. Reuse tested infrastructure where it fits. Generate novel mechanics and adapters where it does not. Do not reintroduce the old paid task-graph planning loop or promise zero inference for arbitrary new mechanics. The workflow, identity, budgets, checkpoints and legal transitions are deterministic. Game design and new code can remain model-generated.

Asset compatibility is a relation between **the exact asset revision, its intended role, the intended integration and the target runtime**. It is not a universal property of a listing. Derive required capabilities from the approved user request, inspect actual instances/media/source, compare the two, and record each missing capability and a testable integration obligation. An LLM may interpret intent and propose an adapter, but it cannot turn guesses into native evidence or invent additional requirements that disqualify the user's selection.

| Outcome | Meaning | Example and action |
|---|---|---|
| Usable as-is for this role | Evidence supports the required asset capabilities. Integration still needs testing. | A tree mesh used as scenery can be placed without a growth script. |
| Usable with integration | The asset supplies reusable content but lacks behavior or binding that Takko can implement. | A sword-shaped model needs a Tool/Handle binding and combat logic. A decorative car needs separately implemented driving behavior and any necessary structural adaptation. Retain the selected asset and test the adapter. |
| Blocked by a known constraint | A concrete requirement cannot currently be met by the available integration. | A selected clip targets a different skeleton and no validated retargeting path exists. Explain the rig/retargeting choice. Inaccessible animation permission needs user/platform action. Never silently substitute. |
| Unverified | Evidence or an adapter test is missing. | Incomplete native capture or unknown embedded dependencies. Inspect or test the missing fact before labelling it incompatible. No repeated paid guessing. |

Availability/identity, scene structure, skeleton/joints, physics/attachments, media loading, embedded behavior/dependencies, permission and actual runtime observations are separate evidence dimensions. Visual and semantic fit remains partly user judgement. Native import does not establish intended gameplay. A static target need not have a Humanoid, a farming crop need not ship with a farming system, and an animation need not already contain the app's preferred hit markers. Missing scripts often represent the code Takko is supposed to generate.

Current source illustrates the problem: `assetRoleEvidence` infers roles from explicit intent or legacy text, and its Tool branch blocks a model with no Tool instance. This accurately says it is not already an equippable Tool, but does not prove that it cannot be adapted into one. The proposed capability-gap representation must separate those meanings, preserving source/security checks and user intent. Unknown roles must not become a permanent genre restriction. Their required structural capabilities and generated integration need explicit evidence and tests.

Validate the general solution with frozen contracts across combat, obby checkpoints, farming/growth, racing/laps and a custom mechanic held out from implementation. Each must check selected-asset preservation, bounded model dispatch, real import/export boundaries and observable behavior. Include both content-only assets needing generated behavior and assets with reusable existing behavior. Those cases test generalization across responsibilities, not a promise that five genres cover every game. Report failed attempts and cost per successful tested build. The earlier zero-inference target applies only to unchanged, fully supported component assembly. Novel model-generated code still needs independently specified acceptance checks, bounded spending and, for measured cost/quality, separately authorized real calls.

Roblox platform references: [Rig Generator](https://create.roblox.com/docs/studio/rig-builder) describes distinct skeleton structures, and [animation asset permissions](https://devforum.roblox.com/t/improving-animation-asset-permissions/3852101) describes experience access. These are concrete platform constraints, not reasons to reject an asset merely because it lacks game-specific scripts.

Revision status: proposal only, no implementation or new tests. Application source is unchanged, so the prior full check remains the last regression result and does not validate this proposed architecture. Cost $0.

### Deep asset inspection, extraction and behavior-preserving adaptation

The user's nested-audio and scripted-NPC examples are required cases for the general proposal. Treat an asset as a hierarchy of reusable content and behavior. Inspect its descendants, properties, source, module references, events, configuration and execution context before deciding what to extract, preserve, adapt or generate. Import for initial inspection without executing embedded scripts. A container's category or presence of scripts does not alone establish relevance, safety or incompatibility.

- **Audio inside a rig:** locate actual Sound instances and exact content references, settings and effect children. If the sound exists only through source code, trace the supported source/configuration reference separately instead of pretending an instance was captured. Extract a derivative containing the chosen audio and required settings/dependencies, preserving provenance. Bind spatial or global playback according to the request and test both loading and actual audible playback. Do not carry unrelated rig scripts into a sound-only derivative. Unresolved dynamic references remain explicit. Existing source review requirements still apply when code is interpreted or retained.
- **Working NPC:** capture the model's joints/parts plus behavior scripts and their dependency relationships. Preserve working behavior by default. A Script under an NPC in Workspace may already execute correctly. Only relocate when the actual execution/replication or project contract requires it. Rewiring must account for `script.Parent`, relative and absolute paths, ModuleScript requires, ObjectValues, remotes, configuration and lifecycle. Prefer a small wrapper/explicit NPC binding when that avoids disruptive relocation. Prevent both old and replacement controllers from running. Runtime-created or computed dependencies cannot all be proven through static inspection.
- **Host-applied adaptation:** a proposed patch names captured source instances, their preconditions, destination bindings and changed references. Apply to a derivative in Edit mode, preserve originals, compile/check references and verify native behavior before promoting the result. Do not implement relocation through broad text replacement or silently remove useful source to make inspection pass. Execution/capability changes need separate explicit representation, not an accidental consequence of copying a script.
- **Regression cases:** sound deeply nested in an unrelated model with its effects preserved, source-created sound, unresolved dynamic sound reference, NPC with local modules/relative references, changed execution context, respawn, two NPC copies and duplicate-controller prevention. Tests consume actual captured structures and source. Native tests must observe audible output or NPC movement/behavior, not just import success.

Existing foundations read in source: `component-archive.ts` captures structure/source, `component-review.ts` describes source behavior/dependencies/media, `component-media.ts` derives audio candidates, `studio-asset-adapter.ts:1998` discovers audio from current prepared retained components, and `component-adaptation.ts` supports subtree removal, source replacement and source additions under captured parents. The current adaptation schema has no explicit arbitrary reparent/move operation for existing scripts. These functions are evidence of available building blocks, not proof of end-to-end arbitrary extraction or NPC relocation. Improve their producer/consumer contracts and add the missing binding operations rather than rebuilding this subsystem from scratch.

Cost policy: deterministic enumeration, extraction and known structural transformations should not require model deliberation. Review unique sources with relevant dependency and game-context evidence once per valid cache identity. Reuse remains bound to asset/source revision, dependency context and review policy. Pay for genuinely needed semantic analysis or source adaptation, then repair only the observed failure. Do not rebill identical inspection because another stage uses it.

Platform references: [Roblox script types and locations](https://create.roblox.com/docs/scripting/locations) explains execution context, and [Sound objects](https://create.roblox.com/docs/sound/objects) explains spatial/global parenting. Proposal only, $0, no implementation, native tests or new regression run. Existing application source remains unchanged.

### Earlier narrow proposal: optional selected-asset combat assembly

Proposal only, following the user's request for test-driven engineering. No implementation, native session or paid evaluation is authorized by this proposal. Use `agent-orchestration-multi-agent-optimize` and `agent-evals`, implemented with the existing TypeScript/Vitest/Luau harnesses. The skill examples do not require adding Python or a hosted evaluation service.

**Recommendation: add a tested reusable combat component and a deterministic selected-asset assembly path.** Stop asking a coding model to reinvent input, server hit validation, combo state, counters, scene paths and export bindings for every instance of this supported demo. The app can continue generating novel mechanics elsewhere. This is a deliberately limited supported capability, not proof of arbitrary game generation. Do not hardcode the current asset IDs or substitute the old canned `src/core/recipe.ts` output.

The new path starts from an approved behavior contract and exact selected assets. Freeform conversation may still use the existing paid planner before approval. For the known script-free target and animation data, the target is **zero inference calls from build approval through export**, including hidden selection, adaptation and review calls. That is a proposed invariant to test, not a measured saving already delivered. Development effort, asset loading and Studio testing are not free just because inference is zero.

1. **Freeze the input contract.** Record exact asset/version/clip identity, rig, approved segment start/hit/end times, click buffering, 0.35-second grace and counter/reset behavior. Preserve the existing 13-segment intent and surface unresolved choices. One confirmed server hit increments the visible counter once. Specify whether that counter resets on timeout/respawn using the saved intent, rather than silently choosing a new behavior. IDs, namespace paths and placement are produced by host code. A static dummy need not contain a Humanoid to be a valid target.
2. **Preflight the selected content without inference.** Reuse native capture, source screening, role evidence and selected-clip extraction. Do not search for another asset or ask a model to reselect an approved one. Confirm the actual content supports the contract. Unknown rig, missing clip/timing, unreadable content or unsupported dependencies produce `needs_input` with a concrete reason before inference. Unexpected scripts remain subject to existing review policy, they are not silently stripped or executed. A supported script-free data binding is a distinct path through acquisition, not a fabricated successful component-review result.
3. **Assemble a versioned runtime.** Reusable Luau modules own input edges, segment playback/holds, server nonce/order/range checks, hit deduplication and server-confirmed HUD updates. A typed configuration binds the chosen clip, target and timing table. Shared deterministic scene/export code binds floor/spawn/remotes and exact instance paths. Derive from existing useful code only after repairing and testing it in a new derivative, leaving original model output untouched. Animation event markers can be used when present, but arbitrary assets cannot be assumed to contain them. The already-approved timing table remains valid input. See [Roblox animation events](https://create.roblox.com/docs/animation/events).
4. **Use explicit host transitions.** `approved -> preflight -> assemble -> compile_and_validate -> export -> ready_to_test`, with `needs_input` or `failed` branches. Runtime verification is separate. Each action is bound to the contract/content revision and persisted once. A resumed build reuses unchanged completed work. A changed asset or timing invalidates the relevant results. A failed native playback check requests new asset evidence or a component fix, never an automatic paid regeneration.
5. **Keep novel code on a separate bounded route.** A request outside the supported component contract remains visibly unsupported by the zero-inference route. The user may choose the existing model generation route with explicit cost limits. That route retains generated-code review and billing guards, receives deduplicated relevant context and saves valid checkpoints. Unsupported input must not silently trigger paid fallback. Cheaper routing is a later measured optimization, not the first reliability fix.

For assembly of unchanged, tested runtime modules and validated configuration, define a separate deterministic acceptance policy. It must check exact component version/source, legal configuration, asset provenance and actual export structure. Do not forge an LLM review pass or call an LLM to review the same fixed implementation on every build. New model-written code and imported scripts retain their existing review requirements. Native observations remain tied to the exact artifact and asset revision. This policy change is part of the proposed implementation and needs explicit tests.

#### Tests to write before implementation

| Layer | Required assertions | What it establishes |
|---|---|---|
| Route and cost regression | Actual approved-proposal producer output enters the new route. An inference transport that throws on every dispatch records zero attempts through both Engine and OpenCode gateway. Exactly selected IDs persist. No search, planner, asset judge, builder, final model reviewer or repair is dispatched for the supported script-free case. | The supported route cannot spend provider tokens. Fake zero-dollar receipts are insufficient. |
| Deterministic graph faults | Duplicate approval, Stop/Continue, restart at each checkpoint, stale asset version, changed timing, missing clip, rig mismatch and failed export. Bound transitions, no repeated effects, no paid fallback. | Routing and recovery invariants, not gameplay. |
| Combat behavior | Consume the emitted modules/config. Thirteen segment boundaries including skipped frames, one buffered edge, silence, exact grace boundary, early/duplicate/stale hit rejection, death/respawn and final reset. Test public results rather than a private pending-object lifetime. Counter equals accepted server hits, not clicks or completed animations. | Observable runtime logic against the stated contract. |
| Real integration | Keep importer, converter, compiler and exporter real. First replay preserved failure inputs offline, then use exact selected native assets in the throwaway place. Inspect actual serialized names/source and execute emitted code. Mock only inference where a model route is being tested. | Actual compatibility and export boundaries. |
| Native gameplay acceptance | Confirm actual player input, animation motion, target hit confirmation and visible counter on the same exported artifact. Misses and replayed events must not count. Exercise all 13 segments, timeout and respawn. Repeat three fresh sessions, include two-client isolation. Repair the input bridge or have a human perform the input with observation logs. | The tested artifact works in those recorded Studio scenarios. A fake input method or metadata-only success is not acceptance. |
| Generality and packaging | Test at least one additional independently selected compatible clip/target combination not used to implement the adapters, plus incompatible negative cases. Run the same acceptance through the staged packaged app and its actual workspace/paths. | Bounded supported-family coverage and release parity, not arbitrary Marketplace compatibility. |

Use existing historical failures as fixed regressions before changing code. During implementation, make those tests fail for the intended reason, implement the narrow route, then make them pass. New runtime expectations come from the approved behavior and actual native asset captures, not from implementation internals. Native tests need both visible animation observations and authoritative hit events so a counter that increments without playback cannot pass.

#### Financial acceptance and release decision

- Compare the same saved approved contract and exact asset revisions before/after. Record inference dispatch attempts, request bytes, reported input/output/reasoning/cache tokens, actual receipts, peak reserved amount, stage outcome and gameplay outcome separately. Historical scoped-build and golden-review costs are reference measurements from different tasks, not a full-build baseline.
- Offline replay proves path selection, call limits and byte/reservation changes. It cannot measure the token usage or code quality of a future live model. Repricing saved usage is an estimate, not a new provider measurement. For the proposed supported path, zero dispatch is the strongest cost assertion and avoids buying a failed baseline again.
- If evaluating changes to the general model route, one separately authorized run may measure its actual tokens/cost after the free boundary checks pass. It is not enough for that run to be cheaper while still failing. Report cost per successful tested artifact and all failed attempts. No paid before/after study is authorized here.
- Do not replace the installed app until the supported-path regressions, native acceptance and staged-package test pass. The prior full check does not validate this unimplemented route. Run a new full check after implementation, then follow the existing approved-shutdown update procedure. Any remaining playback or counter failure blocks calling this demo working.

Proposal status: written, not implemented. No new runtime test results, no measured post-change savings and no universal success guarantee. Prior full-check results below apply only to the unchanged application source. Proposal cost **$0**.

Read against source `6585663`, the installed and staged service bundles, saved settings and original result records. This is an investigation, not an implementation or another generation attempt. Skill: `agent-orchestration-multi-agent-optimize`.

**The strongest diagnosis is incomplete integration and release validation, compounded by an output-policy defect.** The evidence does not identify an infinite agent loop as the cause of current direct-build failures. Earlier planning contracts caused real failures, but the direct path already removes that planning worker. Several other stops correctly expose missing evidence or broken output. Removing those checks would not make a game work.

### Assessment of the proposed explanations

| Proposed solution | What the current project actually does | Verdict |
|---|---|---|
| Deterministic routing / hybrid AI | Approved fresh OpenCode builds become one host-created `implementation` task. Host code sequences acquisition, coding, review and checks. Exact single approved asset selection bypasses model selection. Scoped edits and legacy builds can still call a planner. | Already substantially implemented. Consolidate the remaining contracts rather than adding another planner. See `direct-build.ts`, `engine.ts:866,3288,4031`. |
| Model cascading | Saved active preset `son` uses the same Sonnet 5.5 profile for all five routes. There is no active decision route. OpenCode sets `small_model` to the same gateway model. Other saved profiles do not imply active use. | A cost opportunity, not an explanation for bad asset identities, packaging or native input. No measured evidence here establishes that any cheaper profile can perform the coding/review tasks reliably. |
| LLM FinOps | Actual receipts, project/generation caps, reservations, unknown-billing refusal and protected review capacity exist. Protection is absent from the installed service. | Implementation exists, release parity and admission estimates need attention. A reservation is not a charge. The unitemized historical ~$3.03 is an accounting gap, not proof of runaway inference. |
| Finite state machine | Host branches control persisted stages, cancellation and checkpoints. This is not a centralized transition table, but the model does not freely select the top-level next stage. | Centralizing legal transitions would aid maintenance. No observed failure requires an FSM framework migration. |
| Token budgets / turn caps | Runtime has 48 steps, gateway has 48 requests, a 15-minute session deadline, 2 MB request bound and a no-code spending guard. Repairs are schema-bounded to 0–3. Saved active preset allows 2, unlike the probes' 0. | Caps exist. The demonstrated defect was an output allowance too small for reasoning plus code, not an absent cap. The no-code threshold is checked before the next call and is not a strict per-call maximum. |
| State/context management | Review includes original sources, requirements, assets and current files through several overlapping context fields. | Measurable duplication and cost. Simplify projections without withholding unique evidence. State corruption is not established. |
| LangGraph / AutoGen / CrewAI refactor | The inspected pipeline uses custom TypeScript host code and pinned OpenCode. None of those frameworks is a package dependency. | No evidence-based reason to migrate. It would introduce a new integration boundary before the existing one is proven. |

### Causes and contributing factors, in priority order

1. **Tests and releases do not consistently exercise the product that is running.** The live service is still PID 14992 on 51256, with main PID 28600. Read-only bundle inspection reconfirmed that the installed service has direct build but lacks role capture, protected review and the coding policy. The staged service has role capture and protected review but still lacks the coding policy. Source fixes therefore cannot establish that the user's installed workflow is repaired. Source's production `createApp` wires both policies at `src/server/app.ts:97`.
2. **Real producer/consumer contracts have failed between individually tested stages.** Preserved examples include approved asset IDs rejected by the binder, native packs rejected by simplified export, missing packaged AST/Rojo tools and generated lookups absent from exported XML. `tests/chat-journey-fixture.ts:51` replaces OpenCode execution and line 79 replaces the native adapter. Its reviewer returns no issues. This is useful UI/host regression coverage, but cannot establish those replaced boundaries or game quality. The later native structural rehearsal closes some of these gaps on a scripted golden, not on a newly generated game.
3. **Output policy demonstrably prevented useful output.** P-Build 1 ended at 8,192 output tokens, all reasoning, with no code. P-Build 2's main request used 19,182 output tokens, including 8,394 reasoning, and submitted four files with the 32,768/medium policy. Both the output cap and effort changed, so this is not an isolated measurement of which change helped most. It does prove the old 8,192 cap could not contain the measured successful response. The provider documents that reasoning and visible output share this limit: [OpenRouter parameters](https://openrouter.ai/docs/api_reference/parameters).
4. **Working behavior remains outside the completed verification chain.** The generated server extends the required 0.35-second grace with 0.15 seconds of slack. A different contract failure assumes a consumed pending object remains present. Native input then failed before an observation timeline. These are three separate issues: model semantics, test interface, bridge operation. Compiling generated acceptance tests, or detecting an `assert`, does not execute them. See `engine.ts:4060–4168` and the preserved probe results.
5. **Context and admission overhead can stop an otherwise affordable run.** This is a genuine FinOps/state-management issue, with the concrete measurements below. It does not establish that context duplication caused a particular wrong model answer.

The earlier [attempt inventory](results/trial-failure-diagnosis/PLAN.md) counts four planning and four asset terminal failures among 12 builds, plus two final-review failures, one runtime failure and one export failure. These are overlapping historical conditions across changing versions, not a current failure-rate estimate. There is no basis for claiming every validator failure was unnecessary or that one subsystem caused all losses.

### Context and budget measurements

The preserved golden review request has **227,223 wire bytes**, a **206,408-byte user context**, and **91,627 reported input tokens** for six generated files. Fresh read-only JSON measurements found:

| Context field | Serialized bytes |
|---|---:|
| retainedComponents | 62,052 |
| artifact | 33,748 |
| existingProject | 31,259 |
| gameContext | 22,040 |
| spec | 12,315 |
| designGuidance | 9,829 |
| runtimeReference | 9,441 |
| approvedProposal | 7,576 |

All six generated source bodies occur in both `artifact.files` and `existingProject.existingFiles`. `spec.requirements` equals `gameContext.playerExperience.requirements`, and top-level `userSources` equals `gameContext.userSources`. The producer is `engine.ts:3484`, with `world-policy.ts:48`. Preserve distinct before/after sources when an implementation backup exists. For a fresh final review, reference one authoritative source body per file and one copy of each requirement/evidence item. Do not solve duplication by discarding asset evidence needed for judgement.

The review receipt reports **$0.183254 input / $0.229214 total**, so about **80%** of that review's cost was input. This is one historical golden review, not a cost breakdown of a complete current build. Data comes from `.forge/trial-rehearsal/native-golden-X5nueF/requests.json` and [the committed review receipt](results/trial-probes/p-review-2/result.json).

The proposed **$1.50 full-build cap is not validated and can fail admission**. At saved rates of $2/M input and $10/M output, the minimum protected final-review envelope is `(400000 + 1024) × 2 + 32768 × 10 = 1,129,728` microdollars. Reusing P-Build 2's first charge and second request reservation would require `13,755 + 376,172 + 1,129,728 = 1,519,655` microdollars. That exceeds $1.50 before acquisition costs or envelope growth. An in-memory reproduction loaded `tests/fixtures/direct-build/6e6ffc7f.json`, generated its spec with `directBuildSpec`, applied `prepareReviewBudget`, and passed the probe's recorded reservations/first charge to `assertReviewBudget` at a $1.50 cap. The first request was admitted and the second refused for consuming protected review funds. Zero transport calls, no saved-state writes. This combines a historical direct-input fixture with scoped-probe receipts, not an executed full build or a proposed new authorization. Size any future cap from the actual combined request envelopes and then reconcile actual charges separately.

### Recommended next work

1. Close the known diagnostic loop without inference: clarify the pending-state contract, correct the grace defect in a separately tracked derivative, and repair or bypass the broken automated input path with a human Studio test of the existing output. Preserve original model outputs and failures. This would establish whether that small combo works, not whether generation is reliable.
2. Package a candidate from one identified source revision, including the coding policy. Rehearse its actual service/OpenCode/acquisition/export boundaries with inference replaced, using both real failed inputs and known-good data. Confirm the exact emitted model policy and budget admission. Install only after the separately required shutdown approval.
3. With new authorization, measure one complete small build through that same candidate and then play-test it. Cost, completion, export, gameplay and publication remain separate outcomes. Do not extrapolate a full-game quote from a scoped combo and a review of a different historical game.
4. Optimize after that baseline: deduplicate review context, make byte/headroom costs visible, then evaluate cheaper models only for bounded non-coding decisions. Keep host-owned IDs, paths, accounting and state transitions deterministic. A smaller no-progress allowance may be useful, but request-count evidence does not currently make it the first fix.

Keep budget admission, source screening, exact asset identity, compile/path/physics validation and honest readiness states. Move deterministic compatibility failures earlier where possible. Audit redundant or unjustified model verdicts against real counterexamples instead of disabling the review/export gates wholesale.

Verification for this investigation: source and bundle reads, redacted settings fields, original receipts, captured-context measurements and the in-memory budget-admission reproduction. No application source changes, inference, credential-vault access, installation, live-process shutdown or Studio session. Investigation cost **$0**. One full `npm run check` passed, exit 0, without crash or rerun: build/typecheck, **1,889 unit tests / 149 files**, **6 Luau scenarios**, **16 plugin scenarios plus plugin/8 injected-source compiles**, **6 guard cases**, CSS **0 errors / 274 warnings**, **21 desktop tests**, production smoke, **108 browser tests**, **10 Electron tests**. No stages skipped. Log: `test-artifacts/generation-diagnosis-full-check.log`. These offline/mock checks cannot establish new model reliability or native gameplay. Live main/service/Studio PIDs remained alive, and test port 4319 was released. Automatic approval review rejected cleanup of `.forge/e2e-projects/run-30876` and ten `takko-electron-journey-*` temporary directories created during this check with “blocked by policy”, without a further reason. They remain intact.

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
- **Other configured models:** five profiles and three presets. The independent read-only check confirmed the active `son` preset routes every phase to Sonnet 5.5, has no decision route and allows two repairs. `typesafe/jev-1.13` ("Jev", `src/generation/decisions.ts`) is a bounded non-coding decision model and is refused for coding. Historical runs used `anthropic/claude-sonnet-5` before 5.5.
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
7. **Repair (paid).** Runs up to the configured `repairLimit`. Trials used 0. The independent read-only check confirmed the active preset value is 2.
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
2. **No complete demo build has run on the current direct path.** Only a scoped combo has been measured. World setup, dummy placement and integration are unmeasured. The earlier $0.50–$0.90 estimate is not a validated complete-build quote, and the suggested $1.50 cap can fail current reservation admission, as shown above. The original probe report's $7.50 discussion is an explicit workload scenario, not a validated price or an observed 30-call current build.
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
