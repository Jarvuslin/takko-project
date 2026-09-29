# Planner constraint sweep

2026-09-27. The full run failed at OpenCode startup. Planning passed on its first response, but no game files or place export were produced.

## Live result: failed before generated code

One authorized $8-capped run, project 25d036de-fb24-4a83-8dfb-bc997dd42886, revision 1, OpenCode mode, unchanged brief and Sonnet 5 route. Both proposal and implementation planning passed on their first responses. The new live outputs also pass the persistent corpus harness unchanged. The plan has 13 requirements and 7 tasks. No planner correction, no model swap, no coordinator switch, no optional sampling and no terminal retry.

All three groups were selected automatically: dummy 1245720733 confidence 0.83 (1/30 passed), animation 2801965424 clip1/18/2 Right Punch confidence 0.95 (7/46 passed), sound 101355487033225 confidence 0.87 (7/30 passed). The animation is R15, 0.700 seconds, Studio-only. Its publishing limitation remained visible. There was one 33-call relevance pass. The duplicate-pass defect was not fixed and was not incurred in this trial. Exactly one Approve & build action.

Dummy acquisition retained an audited derivative after removing its unwanted respawn behavior. The adapted review needed one correction for exact captured-content-reference coverage, then passed. This was a bounded acquisition-review correction, not another terminal planning gate. Animation acquisition hit the known unsupported structure/capability boundary. Audio native capture reached evaluation, where the unchanged Sonnet route returned HTTP 404. Both acquisition failures became explicit unmet requirements and coding was allowed to continue. No actual safety finding was reported.

OpenCode then exited after 3,936 ms. The host recorded one failed runtime job, no session/message IDs and no provider exchanges. The CLI's own log records one internal session, ses_f1c3c8817ffeyqEVqrUQ2ChaPR, so claiming that no session was ever created would be wrong. Its log ends during startup/location services. No stdout/stderr diagnostic reached the host. Windows Application 1000/1001 records in the inspected time window supplied no matching OpenCode event. The host discards the child exit code, leaving the root cause unestablished. Do not call this a confirmed native crash, provider error or model-output rejection.

**Generated game files 0, completed tasks 0/7, generated-game Luau compiles 0, export requests 0, exported .rbxlx none.** One native component was retained as evidence, but that is not a generated or playable game. The 900-second runtime timer was entered and stopped after 3.936 seconds. Zero of 48 provider exchanges were used. No Studio gameplay was tested.

### Why the sweep missed this failure

The planner corpus contains JSON and structured saved project state. It cannot predict an external executable exiting during startup. The post-plan inventory did include runtime admission/lifecycle failures, and all three fresh pinned-CLI replays actually completed immediately before this live run. Those successful offline executions did not reproduce this particular early exit. They mock the provider and asset results and cannot establish reliable live startup. The same binary/model route alone is insufficient evidence of parity. The missing retained exit code is a concrete observability gap. No runtime fix, replay of the paid run or fresh paid call was attempted after this failure.

The next useful investigation is free: preserve this exact runtime directory and accepted project, record exit code/signal in an isolated diagnostic runner, and reproduce startup with paid transport physically replaced by a mock. Start from the actual accepted live state and acquisition evidence rather than another planner fixture. Do not buy planning or asset acquisition again merely to investigate startup.

### Verification and preservation

Final full npm run check exited 0: 1,615 unit tests / 110 files, six Luau scenarios/four sample compiles, 14 plugin groups plus plugin/eight injected-source compiles, six guards, CSS 0 errors / 556 warnings, TypeScript/Vite, 14 desktop tests, production smoke, 171 browser passes / one existing skip (7.6minutes). The initial full check failed in the new test's JSON-schema TypeScript narrowing. That own-test error was corrected. An intermediate full check passed 1,611 unit tests and 171 browser tests before the last sweep fixes. Its evidence and the initial failure remain preserved.

Final focused suite: 35 tests / three files. Three final actual-CLI offline replays passed for $0: 28/22/20 exchanges, 13/10/9 tasks, 7/4/5 synthetic files. Initial red regressions and all intermediate matrix/audit attempts are retained. These checks do not prove Studio gameplay or live-provider coding.

All 6,078 pre-existing result files remain hash-identical. Changed check artifacts were archived before restoring originals (23 on the first restoration,28 on the final restoration). Source work and earlier failures were not reset. The exact failed CLI runtime directory, including logs and SQLite/WAL files, was copied under opencode-runtime and the original remains at C:/Users/7474g/AppData/Local/Temp/takko-opencode-JM8zOY. Asset evidence, raw provider responses, reservation log, per-call ledger, screenshots and video remain under this run's evidence directory. No provider key was copied into evidence.

Owned service PID 8968 on port 4335 and browser exited. Final port audit: no listeners on 4318, 4319, 4320, 4324, 4335, 4336. Studio PID 6604, instance ca13ff86-472b-4f75-82a8-b2300a2d1b76, place 122588481889475 is in Edit with zero scripts/scopes, matching the initial inventory. Acquisition staging/imports were cleaned by the application. No original scripts needed restoration. No bridge apply, user-app restart or place delivery occurred.

### Costs

42 calls. Jev interpretation2/$0.000096, proposal1/$0.036652, relevance33/$0.010372, implementation plan1/$0.247528, acquisition5/$0.998470 conservatively. The acquisition total includes a $0.601792 unresolved reservation charge for the HTTP 404 audio request. OpenCode coding, game review and export each$0.

Known billing receipts total $0.691326. Actual account usage delta $0.691308398, a $0.000017602 rounding difference. Conservative ledger total $1.293118, active reservations 0, one unknown billing hold retained. Historical accounted total $8.660568 includes previous holds and this new hold. No assertion that the provider actually charged the404 reservation.

Balance at 2026-09-27T16:48:27.136Z: account $13.703317954, key allowance $12.195796480. Starting account $14.394626352/key$12.887104878 at 2026-09-27T16:27:52.221Z. Every call, conservative reservation, cumulative amount and ledger-derived remaining amount is in COSTS.md and ledger.json. The unspent portion of the $8 cap is not permission to retry. The optional $2 sampling allowance was unused.

## Evidence and replay

The eight preserved outputs include two proposal documents, five implementation plans and one malformed implementation response. They are not eight interchangeable plans. The harness uses each producer contract and the saved terminal project, which retains the actual approval. The pre-build snapshot precedes approval and cannot supply approved proposal source IDs. The initial harness mistake is retained in `baseline/`, the corrected baseline is `baseline-final/`.

Run `npx tsx scripts/replay-planner-corpus.ts <new-evidence-directory>`. `matrix.json`, `MATRIX.md` and source hashes are written without modifying the inputs. Schema failures remain failures. An explicitly labelled diagnostic projection omits invalid optional section labels or architecture metadata to exercise independent downstream checks. No required value is invented. Malformed JSON blocks typed checks. Proposals are not passed off as implementation plans.

| Output | Baseline rejection | After changes |
|---|---|---|
| Run 12 proposal 0 | none | none |
| Run 12 plan 1 | animation/ui in task section labels | same strict rejection |
| Run 12 plan 2 | architecture self-edge e8 | same strict rejection |
| Run 13 proposal 0 | accepted seven-term Model query | rejected at authoring, names dummyModel |
| Run 13 plan 1 | seven-term query | same rule, now names dummyModel |
| Run 13 plan 2 | ui in task section labels | same strict rejection |
| Run 13 plan 3 | malformed JSON at 20993 | same rejection using production fence parser |
| Run 13 plan 4 | ui in task section labels | same strict rejection |

**Run 13 attempts 2 and 4 do not pass unchanged.** No independent downstream semantic violation was found behind their invalid optional section labels. Clearer contracts cannot retroactively change model output. Accepting those labels would violate the instruction to keep validators strict. Prompt effectiveness remains a live measurement, not an offline claim.

## Changes

Requirement categories and task document-section dependencies now have separate named vocabularies in the actual planner contract. The section schema describes the distinction with genre-independent examples. The accepted enum is unchanged.

Proposal authoring and planning share asset need checks for Model query length, duplicate need IDs, valid requirement IDs, primary intent links, companion Model discovery for MeshPart needs, and nonblank query/role/constraints. The proposal prompt explicitly states the query rule. No query is silently rewritten. Proposal titles now use the plan's 80-character contract. Planner-owned `.client.luau` and `.server.luau` paths are checked against the same container rules the bundle stage uses.

Implementation acceptance collects independent semantic errors across requirements, reference decisions, Marketplace policy, proposal provenance and approved asset binding. Reference and Marketplace checks also collect multiple failures. The correction callback receives the whole diagnostic instead of buying another response to discover the next independent error. Schema validation remains first and strict.

## Constraint inventory and correction reachability

`scripts/audit-planner-constraints.ts` produces a persistent inventory. Current results are under `docs/results/planner-sweep-20260927/inventory-release/`: 83 source sites, 338 individual schema constraints. Counts include aggregate error sites and non-planner bundle/research/edit checks, labelled separately. They are not 421 unique semantic rules. Architecture has five custom checks. The old count of 19 throws in validation.ts includes bundle/runtime checks, so throw counts alone are not a planner gate inventory.

The generated GATES table contains source locations, full expressions, diagnostic identity, correction reachability and first author/acceptance. JSON-schema paths include every enum, pattern, numerical/string/array bound, required-property set, type and strict-object rule. Custom refinements appear as source sites. The earlier post-plan gate enumerator was also rerun in `post-plan-inventory/` to retain the acquisition and runtime boundary inventory.

Fresh planning calls `validateImplementationPlan` inside Engine.call's validation callback. Zod parsing, requirement provenance, task DAG/ownership, reference decisions, discovery rules, proposalPlanFor and buildAssetNeeds all precede acceptance. The later bindProposalPlan/buildAssetNeeds calls repeat the same pure checks on accepted state. Scoped edits also validate their merged plan in the callback before committing. This is not a claim that all runtime failures can be repaired by a planner.

Remaining checks outside planner correction are host approval/cancellation, explicit unanswered user decisions, acquisition safety/evidence/lifecycle, compiler/runtime readiness, generated-code contracts, and export/delivery. Approval and safety must not be invented by a model. OpenCode receives submit_task contract/compiler failures through its tools. The three legacy replays exercise that path with mock completions and actual CLI transport, not real generated gameplay.

## Cross-phase audit

| Field or constraint family | First author/acceptance → later consumer | Finding / disposition |
|---|---|---|
| Model query terms | proposal → discovery policy | Fixed shared four-term validation and prompt. Bad saved proposal remains preserved. |
| Need ID uniqueness, blank text | proposal → plan / asset pipeline | Fixed shared authoring validation. Original strings are retained, not normalized into success. |
| requirementId syntax | proposal need → requirement schema | Fixed shared authoring syntax check. Requirement existence is checked when requirements are authored. |
| Title length | proposal max120 → plan max80 | Fixed same title schema at both boundaries. |
| Script suffix/container | plan file ownership → bundle kind/container | Fixed `.client` / `.server` paths at plan acceptance. Generic `.luau` kind is not yet known and remains a bundle check. |
| Categories / section dependencies | sibling planner fields → task binding | Strict vocabulary unchanged. Contract distinguishes implementation category from approved document sections. |
| Requirement provenance, priorities and ownership | request/approval sources → plan binding | Current source enum advertised. Required section coverage uses sourceId and owning task, not category labels. Checked inside correction. |
| Asset intent requirement links | proposal descriptive intent → implementation requirements | Requirement existence cannot be checked before plan requirements exist. Deliberate enrichment boundary, not permission to invent IDs. Planning checks all primary and related links. Primary-link inclusion and related-ID syntax are now checked at proposal authoring. Missing intent on legacy proposals may be authored during planning. |
| Need positions, maxSize, kinds, text bounds and array16 | proposal shared assetNeedSchema → planner / acquisition | Same schema. Animation container kind conversion is host-owned and reparsed in correction. No narrowing bound found. |
| Section text / assumptions → requirement source quotation | proposal text up to6000 → sourceQuote max3000 | Host copies/truncates evidence to3000, preserving structured sourceId. No downstream rejection solely from long approved prose. |
| Task IDs, requirements, DAG, file ownership | planner contract → ordering / task submission | Checked before acceptance. Asset integration can add later tasks with its own checks. Native side effects cannot be proved from planner JSON. |
| Architecture node/edge limits, endpoints, uniqueness | editor or planner architecture → source/binding | Shared architectureSchema at authoring. Self-edge is rejected in correction. No auto-removal. |
| Reference decisions | research evidence → plan | Same research mechanic IDs and current user sources are available. Collected diagnostics name mechanic IDs. |
| Selected asset ID/kind/need linkage | picker/proposal → buildAssetNeeds | Structured assetNeedId used when available. Legacy semantic matching may be ambiguous, but is checked in correction. State missing an option/attachment is a host-state issue. |
| Raw animation without published ID | preview → acquisition / generated use | Previously fixed tiered support and visible publishing limitation. Keep Studio-only clips, don't invent published IDs. |
| Inspection completeness | preview10k walk → inspection | Previously replaced3000-node cap with4MB serialized bound. Explicit incomplete-coverage acknowledgment is separate from actual findings. No safety bypass. |
| Preview fidelity and runtime assets | captured geometry/motion/audio metadata → native acquisition | Preview is not proof of permissions, source safety, playback or serialization. Known acquisition gaps may continue with blocked coverage. This is an external evidence boundary, not a promise every preview imports. |
| Proposal surgical text edits → authored assetNeeds | section patch preserves needs → later plan | Deferred semantic risk: changing an asset-dependent section may leave old need intent. No deterministic generic rewrite is justified. Preserve previous selections and require explicit asset replacement where needed. Not exercised by fresh build. |
| JSON contract → strict provider grammar | local schema → Anthropic transform | Known prefixItems numerical bounds remain unsupported by the existing transform. Strict mode remains off. No schema weakening or model change. |
| Unanswered implementation questions | accepted proposal → post-plan user-decision gate | Outside correction intentionally. No honest planner correction can supply missing user authorization. Current brief asks for defaults through proposal. Record if encountered. |
| Duplicate relevance pass | saved recommendations change proposal hash → reassessment | Known cost issue, deliberately unchanged as instructed. |
| Export versus bridge | artifact → delivery | Export is authorized. Native component bridge delivery is a known unsupported boundary and is excluded. Never apply to place 122588481889475. |

The sweep is exhaustive over the enumerated local schema/source sites, not proof against every possible model output or external failure. No optional paid planner sampling was used. The preserved corpus identifies the existing failure classes and lets independent semantics be checked without spending. The authorized full run remains the test of whether the improved authoring contract produces an accepted plan and actual code.

Future corpus entries can be supplied as a third CLI argument: a JSON array with run, index, file, projectFile and proposal fields. Both output and saved-context hashes are recorded. This permits new preserved outputs without editing the harness.

Scoped-plan diagnostics now name the exact task or list the expected and received task/requirement IDs. The broader post-plan inventory found 75 sites: 14 approval/edit state checks, 10 candidate structure/provenance checks, two approved-selection checks, 34 external acquisition/evidence/lifecycle checks, 11 runtime protocol/admission checks, and four worker/compiler checks. It is a separate inventory, not added to the 83 as unique rules.

Additional delivery/runtime boundaries checked before dispatch: GET /api/projects/:id/export requires a non-running ready_to_test/verified project, an artifact, current approvedRevision, and no failed checks. Missing Ref targets are rejected during bundle validation and again during XML serialization. Component XML is host-retained evidence, not planner-authored text. These guards remain enabled.

The planner permits up to 64 tasks with eight owned files per task. The OpenCode job has 48 exchanges and a 900-second deadline. There is no deterministic conversion from task count to exchange count because tools can be batched, so this is a capacity risk rather than a safe bound to infer or silently change. Record actual exchanges, completed tasks and elapsed time in the live result. The $8 cumulative cap can also stop a valid but expensive plan. None of these runtime limits was expanded.
