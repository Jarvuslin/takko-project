# Asset failures no longer prevent coding

2026-09-26 UTC. No paid inference. No app restart.

The preserved step 3 rejection now reaches a completed OpenCode job in an offline replay. It retains five synthetic files across nine tasks and the two successful asset exports. The missing animation and its dependent core-loop requirement remain blocked. This establishes the host execution path, not a working fighting game.

## Changes

- Approved asset acquisition is optional to completing a partial build. The approved specification, requirement priorities, selections and acceptance criteria remain unchanged.
- Settled rejection, capability escalation and safely cleaned acquisition failures continue to later assets and coding. Unknown native effects, failed cleanup, cancellation and failed durable logging still stop the run. An approved fixed pool does not authorize substitute searches or procedural replacements.
- Host-derived missing dependencies appear in coding and review inputs, blocked artifact coverage, pending coverage checks and an explicit unmet-requirements notice in the conversation. The host overrides an erroneous coding-model claim that a missing dependency is implemented. Known missing assets reported as `needed` do not trigger another acquisition loop. Independent structural, source, provenance, compiler and review failures still fail normally.
- Gap summaries respect the artifact schema's 12,000-character bound. Full reasons remain in the acquisition records. A test with 16 failed dependencies caught this additional serialization failure before another live run.
- Review, adaptation and the final asset decision receive the approved clip key, name, animation ID when available, captured instance path and captured node index. The actual saved key `1/1/18/1` resolves to node 149, `Imported/punching animation 1/AnimSaves/punching animation`. This is a fixture observation, not a production special case. Missing, changed or ambiguous capture identity remains explicitly unresolved.
- Once a clip has been mapped, adaptation resolves its path again in the new packet. It does not reuse a stale index or reinterpret the old ordinal after unrelated siblings change. A regression derived from the preserved packet shifts the selected node from 149 to 150 and verifies its identity survives.
- The animation capability contract separates Studio-local registration from publishable animation references. Discovery checks clip availability before offering animation choices and excludes raw-only packs. Automatic selection, refreshed previews and fresh approval use the same eligibility rule. Saved historical choices are preserved. The general Marketplace library can still preview authoring content.
- No automatic-selection confidence threshold, budget limit or historical spending record was changed. Jev receives no code-generation responsibilities.

Discovery now performs additional native metadata and preview reads before offering animation choices. This adds latency, not inference charges. The existing eight-clip preview bound remains. A mixed pack whose published clips occur outside that bound can be conservatively excluded. Standalone published AnimationIds still require permission, rig and playback verification.

## Native animation probe

The free probe ran in the existing Studio instance for place 122588481889475. A minimal two-part rig with an AnimationController and Animator played a synthetic KeyframeSequence. This was not the approved R15 pack or the fighting game.

| Context | RegisterKeyframeSequence | Assign returned ID and LoadAnimation | Observed movement |
| --- | --- | --- | --- |
| Studio Edit tool context | Returned a bare hash string | Registration only | Not tested in Edit |
| Ordinary server Script in Play | Passed | Passed | Approximately 0.976 radians of Motor6D motion, track length 1 second |
| Ordinary client LocalScript in Play | Passed | Passed | Approximately 0.976 radians of Motor6D motion, track length 1 second |
| Server and client with `hash://` prepended | Registration passed | Assignment passed, LoadAnimation rejected the unknown protocol | No playback |

The returned identifier must be assigned unchanged. The reviewer was wrong to treat a published AnimationId as necessary for all Animator playback. Ordinary scripts could register the sequence inside Studio, so the observed operation was not restricted to the privileged tool context.

Roblox documents these temporary registration IDs as usable only inside Studio, with Animation capability required. Takko has no animation publishing workflow. A production runtime path for raw-only packs therefore remains unsupported, and discovery excludes them from game approval. Sandboxed capability combinations and published-server execution were not empirically tested. [Roblox KeyframeSequenceProvider documentation](https://create.roblox.com/docs/reference/engine/classes/KeyframeSequenceProvider#RegisterKeyframeSequence).

The two additional Edit-ID cases also registered the identical sequence inside each script. They do not independently prove that an Edit registration survives transfer to another runtime. No such claim is made.

Before the probe, the place contained no LuaSourceContainers. Afterward all probe rigs, scripts and the probe folder were removed. Studio was stopped and confirmed in Edit mode with no LuaSourceContainers or probe folder. No original scripts required restoration and no Takko test service was started for this probe.

## Offline verification

The initial failing tests and subsequent results are retained in [the evidence directory](results/asset-failure-continuation-20260926). The first rejection double supplied a recorded rejection reason at the adapter boundary. Its receipt/classification setup was corrected, then the regression was strengthened to replay the real component-review, adaptation-rejection and final decision responses through their production validators. It loads a copy of the real component packet. It never rewrites the preserved original evidence.

The integration regression drives the complete host path to `ready_to_test`, checks that other assets survive, verifies blocked coverage even when a coding model overclaims, checks all three selected-clip input contexts, and checks historical charges, cumulative generation state and selections remain equal. A separate regression proves unknown native import effects still block coding. API coverage verifies the real raw-only pack is absent from offered animation choices. Browser coverage checks the visible unmet-requirements notice.

The pinned real OpenCode executable completed all three replay cases through host MCP tools. Provider replies, Studio and compilation are offline doubles, and the files are deliberately synthetic.

| Saved planner case | Planner calls | OpenCode exchanges | Completed tasks | Synthetic files | New charge |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2026-09-24 fighting | 1 | 28 | 13 | 7 | $0 |
| 2026-09-25 minimal | 2 | 22 | 10 | 4 | $0 |
| 2026-09-25 step 3 with rejected asset | 1 | 20 | 9 | 5 | $0 |

Final `npm run check` exited 0. Complete output: [check-complete.log](results/asset-failure-continuation-20260926/check-complete.log).

| Stage | Actual result |
| --- | --- |
| Vitest | 1,575 passed in 103 files |
| Luau | Six offline scenarios passed, four sample scripts compiled |
| Plugin | 14 groups passed, plugin and eight injected sources compiled, Studio APIs mocked |
| Guards | Six expected outcomes matched |
| CSS | Zero errors, 556 warnings |
| Build | TypeScript and Vite passed, bundle-size warning remains |
| Desktop | 14 passed |
| Production smoke | HTML, bundle, API and unknown-route checks passed |
| Browser | 167 passed, one existing mobile pointer/keyboard resize skip, 168 total |
| Real CLI offline replays | Three completed OpenCode runs |

Earlier complete checks are also retained: `check-1.log` passed with 1,573 unit tests and `check-final.log` passed with 1,574. The actual final check above includes both later regressions, bounded gap summaries and selection preservation after capture indices shift. Focused testing also caught four legacy optional-policy regressions when escalation continuation was initially too broad. Continuation was restricted to approved reference pools and the existing pipeline suite passes unchanged.

Native gameplay, actual generated fighting-game behavior, live model correction quality and paid coding cost remain unproven. The native probe establishes only the stated local animation API behavior. Offline compiler doubles in the replays do not establish generated-game compilation or gameplay.

## Cost and process state

New paid calls: 0. New inference cost: $0. No balance API refresh. Last observed balances remain account $15.695328280 and key allowance $14.187806806 at 2026-09-26T00:08:28.762Z. Historical accounted spending $6.066664, including prior holds, remains unchanged. No live reservation was made. Offline runs exercised reservations in isolated synthetic ledgers.

No paid run, paused goal or running app was resumed. At 2026-09-26T02:15:07.2179416Z, no listeners remained on 4318, 4319, 4320, 4324, 4335 or 4336. Studio PID 6604 remains and Edit mode was reconfirmed. All 261 files in the four protected result directories match the recorded hashes. See [final-state.json](results/asset-failure-continuation-20260926/final-state.json) and [native cleanup](results/asset-failure-continuation-20260926/native-cleanup.json).
