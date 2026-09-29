import fs from 'node:fs';const out='docs/results/demo-export-20260927';const file='docs/demo-export-benchmark.md';let s=fs.readFileSync(file,'utf8');s=s.replace('Verification and the authorized run are in progress. This report does not claim delivery or gameplay.','The authorized run failed during implementation planning. No Luau files were generated, no generated files compiled, and no .rbxlx exists. The three requested fixes passed offline checks, but the end-to-end success bar was not met. No retry or gate fix was attempted.');s=s.replace('## Live run in progress','## Live run');s=s.replace('Paid-run terminal result, final costs and export path remain pending.',`## Terminal failure and exact evidence

First implementation response used invalid proposalSections values: t_client_input included "animation", and t_hud included "ui". Its architecture was valid. The existing correction loop sent validation feedback and allowed one correction. The corrected response fixed those enums but introduced edge e8 from hit_counter_state to hit_counter_state for PlayerAddedOrRespawn. Its effect was to reset the counter on join and CharacterAdded.

src/generation/architecture.ts:50-58 rejects an edge whose endpoints are equal. Terminal message: "Could not complete planner. architectureProposal: Connect two different systems that exist in this architecture. Allowed model attempts exhausted."

This check was INSIDE the bounded correction path. It was not the old outside-correction proposal-binding defect. The correction introduced a different invalid graph and exhausted the two-attempt allowance. Both real responses are preserved as planner-output-1.json and planner-output-2.json, with untouched raw responses in traces. Read-only offline schema validation reproduces the exact errors in planner-gate-analysis.json. No changes to this gate were made.

The implementation plan was never committed. Asset acquisition never started. The raw animation's publishing limitation was visible in the picker and remains linked to the proposed punch_animation requirement, but no artifact or blocked-requirement coverage was produced. There was no incomplete-coverage limitation on the three selected assets because their current inspections completed.

OpenCode sessions 0, exchanges 0 of 48. The 900-second coding deadline was never entered. Generated Luau files 0, generated compiles 0, export calls 0. The export endpoint was not reached because ready_to_test was never reached. Exact .rbxlx path: none. No assessment of game quality or gameplay is possible.

## Costs

| Phase | Calls | USD |
|---|---:|---:|
| Jev brief interpretation | 2 | 0.000096 |
| Initial proposal | 1 | 0.057390 |
| Asset relevance | 66 | 0.020848 |
| Implementation planning, including correction | 2 | 0.377584 |
| Acquisition, coding, review, export | 0 | 0.000000 |
| Total | 71 | 0.455918 |

Every call and conservative reservation is retained in COSTS.md, ledger.json and dispatch-reservations.jsonl. Active reservations 0, new unresolved billing holds 0. Provider account usage increased $0.455879164. The $0.000038836 difference is conservative per-call rounding. Actual provider balance polls lagged receipts, then settled at account $15.207449868 and key remaining $13.699928394 at 2026-09-27T05:20:34.205Z. Historical accounted total is $6.554594, including prior holds. Unspent authorization is not permission for another run.

The second automatic relevance pass repeated 33 paid calls for another $0.010424. Recommendations changed the proposal hash used by the browser discovery trigger. This is a remaining duplicate-work defect, recorded without expanding this run into a further fix or trial. The original ordering failure was addressed: relevance received all three authored need identities and saved recommendations.

## Cleanup and limits

Owned test service PID9784 on port4335 stopped, and the recording browser closed. No listener remains on 4318,4319,4320,4324,4335,4336. Studio PID6604 remains in Edit on instance ca13ff86-472b-4f75-82a8-b2300a2d1b76, place122588481889475. Read-only final inventory found zero scripts and zero Forge scopes. Imports for inspection/preview remained detached and were destroyed by the production capture path. No probe scope or original script was changed, so none required restoration. No bridge apply, gameplay, app restart or Studio restart occurred.

All 5,794 protected prior result files match their original hashes. Preserve the current failed run, the source changes, and .forge/evidence-backup-demo-export-20260927. Another paid run needs new authorization. Other paused generation and business-demand work remains untouched.`);fs.writeFileSync(file,s);fs.copyFileSync(file,out+'/RESULTS.md');
const note=`## Demo export trial stopped at architecture self-link gate - 2026-09-27T05:20:34.205Z

One authorized $8 run failed in implementation planning. Zero generated files, generated compiles, OpenCode sessions or exports. No .rbxlx path exists. The corrected user instruction is place export only, never bridge apply or modification of place122588481889475. The earlier free delivery precheck was not repeated. No second run is authorized.

Implemented three fixes: inspection uses a 4 MB serialized-byte bound instead of 3,000 nodes, coverage-only results become explicit preview/acknowledgment limitations while actual findings still block, and proposal-authored assetNeeds feed relevance and saved recommendations after early free discovery. Actual native asset14056318312 captured 5,334 nodes, zero scripts, 427,439 packed bytes. Original partial fixture and all failures preserved. Regression red run: five failed/31 passed. First full check failed with 13 failed/1,577 passed due missing authored test needs and guard-order regression. Corrected full npm run check exited0: 1,591 unit tests/108files, six Luau scenarios/four compiles, 14 plugin groups plus plugin/eight source compiles, six guards, CSS zero errors/556warnings, TypeScript/Vite, 14 desktop tests, production smoke, 171 browser passes/one existing skip. Separate coverage acknowledgment browser check passed. All three actual pinned-CLI offline replays passed for $0 with 28/22/20 exchanges, 13/10/9 tasks and 7/4/5 synthetic files. None proves live generated gameplay.

Project1c246bdd-70a8-4f78-8440-2e36a5a3f4df, revision2. Automatic dummy1245720733 score0.85 and sound101355487033225 score0.84. No animation passed0.8, so authorized manual fallback previewed/saved R15 animation12061946559 clip1/1/18/1, duration0.600s, last confidence0.70. Raw publishing limitation visible and tied to proposed punch_animation requirement. All selected inspections completed. No blocked artifact coverage exists because no plan committed. Exactly one Approve & build action.

First plan used invalid proposalSections animation/ui. Correction fixed them but introduced edgee8 hit_counter_state -> hit_counter_state for respawn reset. architecture.ts:50-58 rejected the self-link INSIDE correction, exhausting two attempts. No gate fix/retry. Both real responses and offline schema reproduction retained. Also observed duplicate automatic relevance after saving recommendations changed proposal hash: second33calls cost$0.010424. Remains unfixed, not hidden from costs.

71calls, total conservative $0.455918: Jev interpretation2/$0.000096, proposal1/$0.057390, relevance66/$0.020848, planning2/$0.377584. Acquisition/coding/review/export$0. Reservations0, new unknown holds0. Provider actual delta$0.455879164, rounding difference$0.000038836. Starting account$15.663329032/key$14.155807558 at05:10:37.317Z. Settled account$15.207449868/key$13.699928394 at05:20:34.205Z. Historical accounted$6.554594 including previous holds. OpenCode0/48, 900-second deadline never entered.

Owned servicePID9784/4335 stopped, browser closed, no listeners4318,4319,4320,4324,4335,4336. StudioPID6604 stays Edit, instanceca13ff86-472b-4f75-82a8-b2300a2d1b76, zero scripts/scopes. Detached imports cleaned, no original scripts/probe scopes to restore, no game apply or user-app restart. 5,794 original evidence files hash-identical after archiving27 new check artifacts and restoring originals. Report docs/demo-export-benchmark.md. Evidence docs/results/demo-export-20260927/. Do not delete its backup, retry paid generation, alter Studio, or resume other paused goals. Next action requires addressing the recorded planning failure offline before any newly authorized trial.

`;
const cont='research/notes/continuation.md';const old=fs.readFileSync(cont,'utf8');fs.writeFileSync(cont,old.replace('# Continue this research\n','# Continue this research\n\n'+note));
