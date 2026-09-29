# Asset search and saved brief sync

Implemented and live on port 4340 after the user-approved restart at 2026-09-29T03:16:22Z.

The tab compares its request and answers with the previous saved baseline when a newer revision arrives. Untouched fields follow the saved project. Genuine local brief drafts remain. Answer comparison ignores key order.

Manual group searches work while the brief has local edits. Generation, inspection, connection and empty-query blockers appear beside the search box. Each group displays its editable query with the description underneath. Planner guidance requests 1-3 broad object or media keywords.

Explicit group searches skip model assessment. Sparse listing-name matches trigger one additional core-word search, such as dummy or punch. Results are deduplicated, existing pagination stays on its original query, and a failed fallback retains the original results with an error. This is a free listing heuristic, not a semantic relevance judgment. Other groups and saved choices are retained.

## Verification

- Focused Vitest: 49 passed across 4 files. Covers order-independent answer equality, query guidance, fallback behavior and the real API route without model assessment.
- Focused Playwright: 22 passed across desktop and mobile. Covers server-side changes under an open tab, real request and answer drafts, reordered answer keys, manual search results and the existing asset selection flow.
- Initial focused browser run: 18 passed, 2 failed because the changed group label omitted the selected suffix from its accessible name. Corrected before the clean 22-test rerun.
- Additional focused proposal tests: 8 passed after updating the empty-results search expectation to include the punch fallback.
- First full check: build passed, Vitest had 1,714 passes and 1 outdated search-call assertion failure. The remaining stages did not run. Log: `test-artifacts/asset-search-check.log`.
- Final full check: Vitest 1,715/1,715 across 126 files, 6 Luau scenarios plus 4 compiled sample files, 15 plugin mock scenarios plus the plugin and 8 injected-source compilations, 6/6 guard cases, CSS lint, 14/14 desktop tests and 4 production smoke checks passed. Playwright: 181 passed, 1 pre-existing mobile pointer/keyboard panel-resize test skipped. Build passed. Full command exited 0. Log: `test-artifacts/asset-search-check-final.log`.

Browser and provider fixtures are offline mocks. They do not establish live Creator Store relevance, animation permissions or Studio gameplay. No Studio session was changed. Paid calls: 0. Cost: $0.

## Live rollout

Port 4340 now belongs to PID 26772 and `.forge/asset-search-host.mjs`. The previous host, PID 42308, rejected all manual searches. It was stopped with explicit user permission. Its one-time recovery was not rerun.

Started `.forge/asset-search-host.ts` via its bundled `.mjs` replacement. It loads the same `.forge/world-policy-live-20260928` store without a recovery mutation. Automatic recommendations remain paused. Manual searches use the fixed free endpoint. Existing $8 cap, profile restrictions, excluded pack, single-attempt policy and user build-approval gate remain.

Read-only comparison confirmed the live request, five answers, discovery, selected dummy 108353927891814, selected sound 133175949071305, attachments, revision 5 and budget ledger match disk. Punch animation is still awaiting user selection.

The capture/verify comparison passed immediately after restart and again after the live browser check. Request, five answers, question context, revision, stage, choices, discovery, attachments, proposal, budget, all 552 charge entries and reservation were unchanged.

A headless browser opened the real project on 4340 and confirmed the query was editable, Search again was enabled, Studio was connected and the false unsaved banner was absent. Screenshot: `test-artifacts/asset-search-live.png`. No live search was submitted or selection changed during this read-only check. Search-result behavior was verified by the focused API and browser tests above.

No source changed after the successful full check, so it was not rerun for the deployment and documentation update.
