# Minimal fighting benchmark failed before OpenCode

2026-09-25. The single authorized paid trial failed at proposal-plan dependency binding. OpenCode jobs 0, generated files 0, Studio applies 0, gameplay sessions 0. The hit counter cannot be assessed because no code was generated. Total accounted cost was $0.245952 against the $6 cap.

Evidence: [RESULTS](results/opencode-minimal-fighting-20260925/RESULTS.md), [terminal project](results/opencode-minimal-fighting-20260925/terminal-project.json), [automatic selection](results/opencode-minimal-fighting-20260925/automatic-outcome.json), [uncut recording](results/opencode-minimal-fighting-20260925/workflow-raw.webm), [per-call costs](results/opencode-minimal-fighting-20260925/COSTS.md).

## Authorized setup

New project `f4858378-2ea6-4465-a96a-c8f4723bbb36` in `.forge/opencode-minimal-fighting-profile-20260925`. Its saved `executionMode` was checked as `opencode`, with zero charges, before opening the paid workflow. Neither older failed project was reused or migrated.

The ignored `.env` contains only the authorized binary setting and a comment. The owned server loaded it after file creation. The binary passed preflight and reported 1.18.31. Its SHA256 is `0242a0dc705af67c90882b456a36b619883c1c786aad8fe071a1bc64e5d1d440`. Credentials remained in the encrypted DPAPI vault and memory. No plaintext key was written or displayed.

Both project and generation limits were $6. The harness disabled automatic correction attempts, fallback models and paid repair. One proposal and one Approve & build action were dispatched. An initial proposal click was locally rejected while automatic asset discovery was busy. It dispatched no proposal inference. After discovery completed, the first actual proposal call succeeded. No terminal failure was retried.

## Automatic Marketplace selection failed

Jev selected zero of the three required groups. Every group ended with `candidateId: null` and `state: uncertain`. The source still requires choice confidence of at least 0.8 and rejects a page if any assessed batch is uncertain. These were low-confidence nominations as well as explicit `none` answers, not eight identical raw null responses.

| Group | Results | Batch 1 raw choice / confidence | Batch 2 raw choice / confidence | Retained selection |
|---|---:|---|---|---|
| Dummy | 30 | #8767186735 / 0.32 | none / 0.44 | None |
| Punch animation | 29 | #2801965424 / 0.24 | #9299841381 / 0.60 | None |
| Hit sound | 30 | #101355487033225 / 0.29 | #88106951421815 / 0.62 | None |
| Unrequested VFX | 29 | none / 0.50 | none / 0.62 | None |

The fourth group is a separate request-understanding defect. Raw-brief discovery matches the word VFX inside the explicit negative instruction “Do not add VFX”. It searches anyway. No product logic was changed to hide this result.

The run then became assisted, as authorized. Through the normal picker, the operator selected returned Training Dummy #1245720733, R15 Punching Animations #12061946559 with inspected clip `1/1/18/1`, and Punch Impact 1 #132504023010884. The excluded VFX group was explicitly skipped using the available Find later control. That control misleadingly records VFX as deferred, not excluded. The planner nevertheless explicitly excluded VFX and returned only the three required asset needs. No VFX was approved or built. There were no product-side hardcoded asset choices.

## Plan size and scope

The planner returned **15 requirements and 10 tasks**, compared with 23 requirements and 13 tasks in the previous run. It planned four script files, three asset needs, seven architecture nodes and seven edges. There were no clarification questions. Thirteen requirements were marked user-origin and two inferred.

The plan describes all four requested behaviors and explicitly excludes VFX, combos, health, enemies, rounds, menus and extra scoring. Successful server-confirmed hits would drive both the sound and a plain Hits counter. Misses would trigger neither. This is a description in the plan, not implemented behavior.

Expansion was mainly implementation detail: animation locking, server validation, lifecycle handling, input binding, fixed floor/walls, camera and lighting defaults. It did not add a competitive multiplayer mode, though it planned per-player state and respawn handling. Ten tasks remain heavy for this small request, including three separate asset-discovery tasks in addition to Takko's asset pipeline. Their eventual coding cost is unmeasured. The paid implementation-plan response took 179.054 seconds, reported 17,905 output tokens and cost $0.218396 before any coding.

## Exact failure and root cause

`Implementation dependency coverage is missing for proposal section: theme`

Every returned task has `proposalSections`, but none includes `theme`. `bindProposalPlan` in `src/generation/proposal.ts` requires coverage for mechanics, theme and environment. The `proposal-build` branch calls it after the plan call has passed its other validation and been saved. That throws before asset resolution or OpenCode launch. The plan is therefore marked as a successful provider call in billing while the overall build fails.

The saved real project reproduces this exact rejection offline. Adding `theme` to the existing environment task in an in-memory diagnostic clone clears this one guard. That clone was never saved or submitted, and this is not a product fix. A future correction should validate complete proposal-section coverage at the planning boundary and handle invalid output within explicitly authorized retry rules. It should not invent extra game systems or silently stamp all sections onto every task.

The previous approved-asset binding failure did not recur. The live run stopped before reaching that gate, so live success there is still unproven. Calling `buildAssetNeeds` against this exact saved plan offline returns three correctly linked needs with no duplicate. This only verifies that helper against the new output.

## Verification and limits

Fifteen offline reproduction assertions passed against the preserved live project. They reproduce the failure, isolate its missing tag, check unchanged saved content, confirm the three asset links, reproduce the negated-VFX discovery defect, and verify accounting and zero generated files. These are diagnostic assertions, not a game pass.

No product source changed. `npm run check` was not rerun in this benchmark turn. Vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e were all skipped. The previously recorded full check remains 1,553 tests in 100 files and 165 browser passes with one intentional skip. Those older offline results did not prevent this live failure. There were no generated-Luau compiles this run and no native gameplay verification.

All 1,143 protected files across the two earlier benchmark evidence directories retain their original hashes. The new raw responses, timing, per-call ledger, automatic outcomes, screenshots and uncut video are retained. The browser recorded no page errors.

## Cost and cleanup

Twelve paid calls: ten Jev calls totaling $0.001114 and two Sonnet calls totaling $0.244838. Total rounded accounted cost $0.245952. Active reservations $0, unknown new billing holds 0. Unspent cap $5.754048 is not permission to retry. Historical accounted cost is now $4.785332, preserving earlier unknown holds.

At 2026-09-25T05:34:11.582Z, OpenRouter reported actual account funds $16.976655630 and key allowance $15.469134156. Account usage increased by $0.245946212, consistent with the $0.245952 ledger after conservative per-call rounding. The first post-run balance read lagged the final call and is retained separately. Per-call balances in the ledger are explicitly labeled calculated, while actual provider polling snapshots retain their own timestamps.

Owned server PID3312 on port4335 and browser PID14612 exited. No user app was restarted or killed. No listeners remained on 4318, 4319, 4324, 4335 or 4336. Studio PID6604 was left in Edit mode in place122588481889475. Before and after native inspection both showed no scripts or Forge/probe/preview scopes, with the original Terrain, Baseplate, SpawnLocation and Camera. No original script required restoration and no temporary import remained. No apply or play operation occurred.

This trial is terminal. Do not restart it, reuse either older failed project, resume paused goals or dispatch a second paid run without new authorization.
