# Post-plan replay and correction boundaries

2026-09-25. Implements steps 1 and 2 of `proposal-plan-binding-diagnosis.md`. No paid run was dispatched.

Both preserved plans now reach OpenCode dispatch through the real Engine, proposal binding, approved asset binding and asset pipeline under external doubles. Both also complete the real pinned OpenCode executable, host MCP tool calls, file submission and final review to `ready_to_test`. This is offline protocol evidence. The generated files and review assertions are deliberately synthetic and do not implement a fighting game.

## Cause and change

The minimal plan had zero requirements sourced from `proposal:theme`. Adding `theme` to a task would only disguise that omission. The old coverage check was also after the provider correction callback, making a correctable structural error terminal.

`validateImplementationPlan` is now the shared candidate validator. Before accepting a plan it validates requirements and task structure, reference decisions, Marketplace intents, asset IDs and links, proposal provenance, and the exact asset needs produced by `buildAssetNeeds`. Direct planning and scoped replacement call it inside their existing model correction callbacks. The coordinator checks the assembled candidate inside the final area's correction callback before checkpointing that area. Existing defensive checks after acceptance remain.

`proposalPlanFor` derives section coverage through `requirement.sourceId` and task ownership. Every approved section must have a required user requirement owned by a task. It applies identically to mechanics, theme and environment. An explicit requirement explaining how existing approved content satisfies a section is valid. The planner contract and correction message make clear that this does not require additional features, tasks or files.

Task dependency maps derive from source IDs and asset requirement links. Existing task section annotations remain additive indirect dependencies. They cannot substitute for missing source requirements. Previously bound scene paths are retained. Candidate validation does not commit a replacement spec, change selections or reset spending.

No fighting-specific product handling was added. The explicit practice-dummy reuse correction lives only in the replay fixture and is labeled as a scripted model response.

## Replay boundaries

Inputs are the untouched `terminal-project.json` files in `docs/results/opencode-fighting-live-20260924` and `docs/results/opencode-minimal-fighting-20260925`. Each replay clones a saved project into a separate temporary store, rewinds only the clone to the planning boundary, and retains its approved proposal, discovery choices, attachments and historical spending. No original failed project is resumed or migrated.

| Boundary | What executes |
|---|---|
| Plan and correction | Real Engine request validation and retry accounting. First response is the actual saved planner output. Correction response is scripted. |
| Proposal and asset binding | Real shared validator, proposal dependency producer, `buildAssetNeeds` and approved adapter. |
| Asset acquisition and validation | Real `resolveAssets` orchestration. Synthetic Studio inspect/place/export receipts, images and audio. Real audio parsing and receipt checks. |
| Unit dispatch checkpoint | Real Engine dispatch and manifest. A declared backend double stops at `OFFLINE_DISPATCH_CHECKPOINT`. |
| Standalone runtime replay | Real pinned OpenCode 1.18.31 executable, local gateway, host MCP, manifest, task context, task submission, checkpoints and completion. |
| Code, compiler and review | Scripted inference writes marker scripts and simple scene objects. Compiler and semantic review are doubles. |
| Studio apply and play | Not performed. |

The synthetic network consumes the actual host `task_context` result when submitting each task. It does not supply a hand-copied equivalent context. The runtime uses an injected inference transport and an in-memory synthetic credential, without reading the vault or sending provider requests.

Model imports are represented by script-free Studio doubles in these replays. Native retained-component inspection, actual Marketplace permissions and media availability remain unproved by this harness. Existing component tests exercise additional simulated branches separately.

## Observed results

| Saved output | Planner responses | OpenCode inference exchanges | Completed tasks | Synthetic script files | New actual cost |
|---|---:|---:|---:|---:|---:|
| 2026-09-24 fighting run | 1 | 28 | 13 | 7 | $0 |
| 2026-09-25 minimal run | 2 | 22 | 10 | 4 | $0 |

The older plan needs no added section requirement. The minimal plan's first response fails with the missing `proposal:theme` source. Its second scripted response adds one explicit reuse requirement to the existing environment task, without adding a task, file or task section tag. The request carrying correction feedback is asserted in the regression test. These results do not establish that a live model will make that correction, or what a live correction will cost.

Neither replay encounters another terminal planning gate after this correction. This conclusion is limited to the actual paths taken by these two saved outputs and the supplied external receipts.

The real minimal task graph also shares broad requirements across tasks. A theme edit's transitive dependency set reaches all tasks even after removing their explicit section tags. The sound task has no direct theme source but remains in that closure. The harness records this as a plan-granularity limitation. It does not delete shared dependencies to manufacture a surgical-edit result.

## Guard audit

`scripts/audit-post-plan-gates.ts` records 76 explicit textual throw sites across the selected current files and the Engine proposal-build through dispatch segment. The diagnosis counted 54 in an earlier, narrower source surface. Neither count is executed branch coverage. Schema refinements and called helpers contain additional checks.

| Category | Sites | Treatment |
|---|---:|---|
| Candidate structure or provenance | 12 | Shared candidate validation checks these before downstream acquisition. Existing downstream checks remain defensive. |
| Approval, saved state or patch contract | 14 | Approval conflicts and absent saved selections remain blockers. Scoped candidate contracts are checked inside their request callback. |
| Approved selection enforcement | 2 | Real approved adapter remains active in both replays. No replacement permission is invented. |
| External acquisition, evidence or lifecycle | 33 | Synthetic receipts exercise the applicable success paths. A Studio-failure regression confirms external failures do not trigger planner correction. |
| Runtime protocol or admission | 11 | The real CLI replay exercises dispatch and protocol success. It does not prove every error branch or every machine configuration. |
| Worker output or compiler contract | 4 | These legacy-worker checks already run inside the worker's correction callback. They validate generated output after planning. |

See `docs/results/post-plan-replay-20260925/GATES.md` for locations and expressions. This inventory is not a claim that all 76 guards ran or that all future model output will pass. It distinguishes correctable candidate defects from legitimate external and state failures.

## Regression and failure evidence

Thirteen new tests replay both saved outputs, reject label-only coverage for each section, derive dependencies without duplicate task labels, route asset-link correction through planning, preserve previous proposals and specs on rejection, retain historical charges, enforce cumulative budget admission, and keep external Studio failures outside planner correction.

Before the product fix, the real minimal output failed at the old terminal theme gate. Class tests also demonstrated that arbitrary tags could pass missing source coverage and that real source coverage without duplicate tags could fail. The old conversation fixture exposed the same testing weakness: all its requirements were inferred while task tags asserted coverage. Its producer response now supplies actual user requirement source IDs.

All local failure logs are retained. Early replay attempts also found fixture defects: an invalid synthetic PNG and an audio-incapable fake profile. Later assertion failures incorrectly expected the approval timestamp to stay unchanged, sound to be unaffected despite the real shared dependency graph, and project budget mutation to override the Engine's configured budget. Those are harness corrections, not extra product defects. `07-first-green.log` contains failures despite its premature filename. `09-focused.log` records 42 passing tests, and `12-guards.log` records the final 13 replay regressions passing. A temporary attempt to use the installed TypeScript 7 package as an AST API failed because that API was unavailable. The final inventory uses a documented text scan.

Full `npm run check` completed successfully. All stages ran: 1,566 Vitest tests across 101 files, 6 offline Luau scenarios and 4 sample compiles, 14 plugin test groups plus plugin and 8 injected-source compiles, 6 guard cases, CSS lint with 0 errors and 556 warnings, TypeScript and Vite build, 14 desktop tests, production smoke, and 165 browser passes with 1 intentional skip. No native Studio gameplay is included. Full log: `docs/results/post-plan-replay-20260925/14-full-check.log`.

## Reproduce without paid calls

```powershell
npx vitest run tests/post-plan-replay.test.ts
npx tsx scripts/replay-post-plan.ts docs/results/post-plan-replay-NEW/runtime
npx tsx scripts/audit-post-plan-gates.ts docs/results/post-plan-replay-NEW
$env:LUAU_BIN_DIR = '.forge/tools/luau'
npm run check
```

The standalone replay requires the already installed pinned OpenCode binary. It refuses to overwrite an existing runtime evidence directory. Its retained temporary workspaces and copied traces are listed in the per-run JSON files.

## Cost, preservation and next boundary

New paid inference calls: 0. Actual additional cost: $0. Synthetic calls record zero charge and release their temporary reservations. The original per-call ledgers, cumulative generation limits and historical holds are preserved. The historical accounted total remains $4.785332, including older unknown holds.

Last observed account funds were $16.976655630 and key allowance $15.469134156 at 2026-09-25T05:34:11.582Z. These are historical balances, not refreshed balances. Both benchmark evidence manifests verify 1,215 unique preserved files unchanged.

No user app was stopped or restarted. No native Studio session, script edit, probe, import, apply or gameplay operation was performed. Studio mode was not re-inspected. The preceding session recorded Edit mode. Test-owned services are cleaned up by their harnesses.

Automatic selection confidence, negated VFX discovery, live model quality and the broader front-loaded planning architecture remain separate unresolved questions. Step 3 requires fresh authorization. The next live observation should test the path through code and apply, rather than using more paid runs to rediscover these offline structural failures.
