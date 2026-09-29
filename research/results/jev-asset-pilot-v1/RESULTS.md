# Jev asset-ranking pilot

16 of 16 calls completed. 16 correct selections.

Synthetic smoke test with assistant-authored labels. No real Marketplace quality or gameplay claim.

Model: typesafe/jev-1.13. Ceiling: $0.05. No retries.

Provider-reported cost: $0.000638232. Unreconciled reservation: $0.000000000.

Before balance: $1.529256456 at 2026-09-20T17:58:26.166Z. After balance: $1.529256456 at 2026-09-20T17:58:29.599Z.

See ledger.json for every call, timestamps, reservation, returned model, scores and usage.

## Settled account allowance

At 2026-09-20T18:01:25.793Z, OpenRouter reported $1.528618224 remaining. The $0.000638232 deduction matches all 16 call receipts. The immediate post-run read above was stale and remains preserved. See key-later.json.

All 16 selections matched the frozen expected labels. All 4 none-fit observations were correct. Choices were consistent in all 8 original/reversed pairs. Median request latency was 205 ms and nearest-rank p95 was 295 ms. First-candidate fixture ordering got 3/16, which is not a comparison against Takko's production selection logic. No claim of real Marketplace quality or calibrated confidence is established by these synthetic cases.

## Final verification

At 2026-09-20 18:05 UTC, the full application check had exited 0: 1,301 unit/API tests in 78 files, 6 offline combat scenarios, 14 plugin mock groups plus compilation of the plugin and 8 injected sources, 6 guard fixtures with expected outcomes, TypeScript/Vite build, 10 desktop tests, production smoke and 74 browser tests. No stages skipped or retries. Separate pilot harness tests passed 16/16. The offline verifier reproduced all 16 request hashes and reconciled every cost receipt. No further paid calls were made. No Studio session occurred and generation remains paused.
