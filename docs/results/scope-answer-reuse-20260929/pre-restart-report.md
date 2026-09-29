# Reusing answered scope decisions

The source fix resolves the preserved single-punch duplicate without inference, and the full `npm run check` passed. The live project has not been changed. Restart permission is required before the prepared recovery can run on port 4340.

## Cause and change

Scope question IDs hash the full generated wording. The planner's successful single-punch edit reworded an already-answered assumption, creating `scope_b739c539bf2a` despite the saved answer to `scope_3a9e8f1bf00e`. Question creation, question projection and answered-question cleanup all relied on exact IDs.

`src/generation/scope-answer.ts` now compares the saved question topic and answer against canonical scope constraints. `scope-questions.ts` and `proposal-questions.ts` share that decision. Exact-ID answers remain supported. Read projection is pure. Cleanup removes answered unresolved entries without rewriting answers, question provenance, mechanics, selections, charges or files.

The matcher recognizes equivalent quantity and negative scope phrases, including the observed input/action and attack-chain wording. Every recognized candidate constraint must be supported by the answer. `Keep these limits` uses that answer's original question as its evidence. New quantities, omissions, numeric bounds, movement restrictions and qualitative bounds remain questions. Potentially truncated legacy questions are not inferred equivalent. This is deterministic matching of supported language, not a general semantic model. Unrecognized paraphrases can remain unresolved.

## Reproduction and verification

Tests consume the preserved planner patch in `docs/results/single-punch-recovery-20260928/planner-output.jsonl`, apply it with the production patch function, then run scope creation and projection using the saved answer/provenance. The saved post-edit project separately tests projection and cleanup. Counterexamples cover new limits, conflicting answers, missing or unrelated provenance, non-combat quantities, keep-limits answers and truncated questions.

Evidence directory: `docs/results/scope-answer-reuse-20260929/`.

- `red.log`: initial reproduction, 8 failed and 4 passed.
- `focused-final.log`: 55 passed across five files before the additional bound cases.
- `additional-limits-red.log`: 3 failed and 15 passed. New `cannot`, `at most` and long-cooldown cases exposed missing constraint forms.
- `focused-complete.log`: 47 passed, 12 unfinished because a Windows worker exited with code 3221226505 in `conversation-planning.test.ts`. This was not a complete pass.
- `check.log`: first full command was intentionally stopped after 89 desktop browser cases because subsequent review changed the matcher. Its earlier stages passed, including 1,704 unit tests. This is not the final full check.
- `check-complete.log`: final full command passed with exit 0. All stages ran.

| Final check stage | Result |
|---|---|
| TypeScript and Vite build | Passed |
| Unit tests | 1,708 passed across 124 files, including 19 new scope-answer cases |
| Luau | 6 offline scenarios passed, 4 sample sources compiled |
| Plugin | 15 groups passed, plugin and 8 injected sources compiled |
| Guards | All 6 cases matched their expected pass/fail outcome |
| CSS | 0 errors, 556 existing warnings |
| Desktop | 14 passed |
| Production smoke | Passed HTML, bundle, API and unknown-route checks |
| Browser | 177 passed, 1 existing mobile pointer-resize skip, 8.9 minutes |

`recovery-preflight-final.log` additionally records two offline operational cases passed. The prepared host bundled and passed `node --check`. It was not launched.

These are offline tests. They do not establish successful Studio gameplay. No Studio session was opened or modified, and its current mode was not re-inspected.

Historical evidence was protected before the checks. Final restoration checked 15,564 files, archived and restored 29 test-overwritten artifacts, and verified all 340 source/test hashes unchanged from the final check's starting manifest. The earlier interrupted check's separate restoration and failure logs remain preserved.

## Prepared live recovery, not launched

The running host is `.forge/single-punch-recovery-host.mjs`, PID 46144 on port 4340. It deliberately blocks explicit asset searches after the preceding failed recovery, so source changes alone cannot unblock the requested search.

Prepared helper `.forge/scope-answer-recovery-host.ts` requires a restart authorization file and refuses a second recovery attempt. Its two offline preflight cases verify success preservation and one-attempt search failure preservation. It uses the same store and project, clears the duplicate using the saved answer, retains no-sequence validation, and searches only `punchAnimation` once through the public Creator Store. No inference is needed for this recovery or search. The excluded pack 12061946559 stays excluded. Fresh listings may reuse saved clip captures only when their content timestamp matches. New options still require the user's normal preview and inspection before selection. No automatic animation choice is made.

Dummy and sound groups and selections remain unchanged. Automatic and repeat assessment/search requests are blocked by the prepared wrapper. It stops at asset review. Subsequent model work requires the user's approval of the current proposal, the same cumulative cap, and no automatic retry.

## State and cost

Read-only audit at 2026-09-29T01:05:00.526Z found the live project identical to the preserved post-edit snapshot. Revision 4, draft, no job, 552 charges. No inference, search, restart or live write was performed by this task so far.

Final audit at 2026-09-29T01:22:24.472Z confirmed the same byte-for-byte project hash and PID 46144 on port 4340. No other recorded app/test port was listening. The prepared recovery remains unlaunched, awaiting explicit restart approval.

Existing cap $8. Charged ledger $0.385091, retained reservation $0.002688, remaining allowance $7.612221. Last reconciled provider totals at 2026-09-29T00:26:25.842Z were actual cumulative $0.384802004, key balance $15.240844430 and account balance $16.748365904. Those balances have not been re-fetched in this task. No budget or reservation was reset.
