# Coordinator and temporary workers

Takko now uses a coordinator for new application projects and fresh planning runs. The coordinator creates planning areas, delegates dependency-ready build tasks, requests focused source inspection, splits eligible unfinished tasks, orders independent reviews and assigns scoped repairs. Workers are temporary assignments with saved identities, objectives, statuses and artifact hashes. Only the coordinator delegates. Workers run sequentially in this version.

This implements the direction the user approved on 2026-09-22. [Design](superpowers/specs/2026-09-22-coordinator-workers-design.md) and [implementation plan](superpowers/plans/2026-09-22-coordinator-workers.md) record the decisions. The current shared checkout includes earlier approved uncommitted features, which were preserved. No commit or push was performed.

## Behavior

The coordinator uses the existing planner model route. Builder, reviewer and repair routes remain capability-to-model assignments rather than a fixed execution sequence. Existing presets still work. The host controls budget reservations, model dispatch, cancellation, namespaces, source provenance, ownership, compilation and acceptance gates.

Planning first saves an outline and shared interface contracts. Temporary planning workers expand individual areas into requirements, assets and small owned tasks. Each area has at most eight requirements and four tasks, each initially owning at most two scripts. The assembled task limit is 64. The global 40-requirement contract remains. Partial area validation preserves architecture source citations while deferring full architecture coverage until assembly. A failed assembly can identify and redo an area plus its actual dependent areas without discarding unrelated work. Interrupted corrections retain their feedback and resume remaining work.

During execution the coordinator receives the approved specification, available tasks, completed tasks, receipts, file and scene indexes, check results and current repair evidence. It chooses a compact action instead of returning code or a replacement full plan. The host rejects unavailable dependencies, completed-task replay, lost requirements, duplicate ownership, premature finish and repairs without a current failed review. Splitting preserves every original requirement, owned file and external dependency. Integration ownership cannot be split after native component contracts have been bound. Existing retained-component and Studio lease controls remain authoritative.

The coordinator can request an inspection of up to eight existing scripts. Inspection findings must cite supplied paths and remain advisory. Build workers receive their exact objective and the shared contracts. Repair workers may change only the selected existing script or scene paths, up to eight per assignment. Scope changes and arbitrary new repair paths require planning or a build assignment, rather than escaping the repair contract.

Reviews now persist one requirement's results at a time. Workers see relevant owned and dependency source, scene context and retained component evidence. Protected test identities remain reserved across requirements. The host allocates the shared 40-test catalog while reserving coverage for remaining required requirements. Optional reviews may return no tests when no slots remain. An interrupted later review resumes without repeating saved valid portions. Final static validation still checks the assembled artifact and full protected acceptance catalog.

Worker output, completion receipts and successful repair-round accounting are committed together at engine save boundaries. A failure after a completed commit does not rewrite the receipt as failed. Failed or cancelled repairs that never committed do not consume a successful repair round, but their model charges remain recorded. Unknown usage retains conservative billing. Stored in-flight workers become interrupted on service recovery. New visual or Studio evidence invalidates the previous review before explicit repair can proceed.

The UI shows coordinator activity with completed and interrupted assignments, worker objectives, inspection findings and failure explanations. The ordinary build plan continues to show dependency and completion state. Internal assignments do not introduce extra user approval steps. Existing brief, asset and assembled-plan approvals remain.

## Reasoning and truncation

Automatic OpenRouter effort now leaves reasoning unset so the provider chooses its default. The previous Sonnet 5 low-effort override was removed. Explicit configured effort remains honored. Existing maximum reply sizes and monetary limits are not silently increased. Models explains the combined reasoning and visible-answer allowance.

Smaller responses and saved boundaries reduce the amount of work lost to truncation. They do not make token limits disappear. A model can still consume its configured allowance before returning a valid response. Such output remains rejected and charged honestly. A user may still need to choose a larger supported reply allowance and sufficient budget. No claim is made that this architecture eliminates truncation or matches a particular model's gameplay quality.

Each coordinator control or planning request has at most two local attempts and no automatic model fallback. Existing builder and repair capability calls retain configured routing and correction policy. A run stops after 96 coordinator decisions even for zero-priced models. Resuming requires an explicit new run. All calls share existing project and generation budget checks.

## Compatibility and scope

The application enables coordination by default. The low-level Engine API retains its legacy default for callers replaying old projects and benchmark fixtures. Saved legacy artifacts retain legacy recovery until a fresh application plan upgrades them. No existing project files or provider credentials were migrated as part of installation.

This is a constrained coordinator with typed capabilities, not unrestricted tool execution. Native asset work still uses the established asset pipeline and leases. The generation process stops at ready to test. It does not automatically establish multiplayer behavior, animation/audio permissions, game feel or visual quality in Roblox Studio.

## Verification record

The initial complete unit run found five failures in two old fixture suites, with 1,412 passing tests. Those fixtures only produced a single full plan and did not speak the new outline/area/decision protocol. The fixtures now exercise the application default. Intermediate fixture failures and diagnostics are preserved under `.forge/coordinator-*` logs.

Independent review found and drove fixes for partial architecture citation validation, failed-assembly recovery, repair allowance consumption, missing shared contracts, scene repair paths, durable coordinator decisions, task-level cross-area dependencies, explicit runtime/visual feedback invalidation, atomic commit receipts and acceptance-test catalog allocation.

The focused coordinator suite passed 16 tests before the full check. It covers staged-plan recovery, stale input, source-backed architecture, dynamic ordering, premature finish, split integrity, failed worker retry, cancellation, real Engine routing/persistence/accounting, budget preflight, stored decisions, restart recovery, atomic repair commits, review checkpoint recovery and Studio-feedback invalidation. Its integration fixture deliberately uses a mocked compiler. The API suite separately exercises generated fixture code through the real compiler. Both use offline model responses.

Two new browser checks passed on desktop and mobile for saved/interrupted worker activity and scrollable explanations. The first browser preflight failed because an in-progress new test had two nullable TypeScript expressions. Those fixture types were corrected before the successful run. No application runtime defect was bypassed.

An additional capacity regression covers 39 required requirements and one optional requirement against the shared 40-test catalog. It verifies that early reviews cannot consume slots needed by later requirements, protected test identities survive, and an optional review may return no tests. This caught an inherited minimum-length schema check, which was corrected using a fresh bounded array schema.

The first full check reached browser testing after passing every earlier stage. Its desktop and mobile HTTP-provider workflow checks exposed a fixture provenance mistake: a clarification answer was attributed to the original request. The fixture now supplies its actual answer source. Earlier results and failure artifacts remain preserved. The final source is checked again in full.

Final `npm run check` passed all stages: 1,434 unit/API tests across 92 files, six Luau scenarios and four source compiles, 14 plugin mock groups with plugin/eight injected source compiles, six guard cases, TypeScript/Vite, 14 desktop tests, production smoke and 153 browser tests. One intentional mobile horizontal-resizer skip remains. A preceding Windows test-worker crash is preserved in the results. The unchanged rerun passed.

The final packaged executable passed an isolated native desktop run through a localhost fixture model, actual compilation and place export, with four completed worker receipts and zero renderer errors. All 34 packaged resources match the build and all 350 recorded source hashes remain unchanged. The desktop shortcut now points to `release/takko-coordinator-workers-20260922-ready/Takko-win32-x64/Takko.exe`. Close and reopen Takko to load it. The current user app was left running. Full evidence, failures, exact boundaries and package hashes are recorded in [RESULTS.md](results/coordinator-workers/RESULTS.md).

Paid inference calls: 0. Inference cost and reservations: $0. No key values were read or output. No user application process was killed or restarted. No Studio scripts, imports, probes or play mode were changed. The paused evaluation and generation goal remain untouched.
