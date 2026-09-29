# Paid-run accounting

Recorded 2026-09-23T19:00:40.151Z. Original total evaluation cap: $4.40. Every row below is part of this authorized retry, not an additional trial.

| UTC receipt | Phase | Reserved | Actual / conservative charged | Source | Input / output tokens |
|---|---|---:|---:|---|---|
| 2026-09-23T18:30:16.896Z | planner | $0.423002 | $0.042042 | provider | 17056 / 793 |
| 2026-09-23T18:31:39.050Z | builder | $0.524330 | $0.160544 | provider | 35627 / 8929 |
| 2026-09-23T18:31:47.259Z | planner | $0.427580 | $0.042672 | provider | 18111 / 645 |
| 2026-09-23T18:33:48.492Z | builder | $0.534042 | $0.199186 | provider | 38098 / 12299 |
| 2026-09-23T18:33:59.947Z | planner | $0.432270 | $0.047512 | provider | 19206 / 910 |
| 2026-09-23T18:39:09.334Z | builder | $0.546370 | $0.369602 | provider | 40956 / 28769 |
| 2026-09-23T18:39:47.136Z | builder | $0.568740 | $0.139164 | provider | 45642 / 4788 |
| 2026-09-23T18:39:59.425Z | planner | $0.436314 | $0.049166 | provider | 20023 / 912 |
| 2026-09-23T18:40:13.986Z | builder | $0.552888 | $0.552888 | reservation | Unknown |

All calls used anthropic/claude-sonnet-5 with 32,768 output allowance and the existing provider-default reasoning setting. No model downgrade. Eight responses completed, one request was cancelled. A successful provider response can still be invalid JSON or semantically wrong.

- Confirmed this retry: $1.049888.
- Cancelled request, unknown usage, retained conservative hold: $0.552888.
- This retry accounted: $1.602776.
- Prior evaluation accounting including the $0.024778 earlier trial: $1.589227.
- All attempts accounted: $3.192003. Remaining authorized cap: $1.207997.
- Outstanding active reservations: 0 microdollars.

Provider balance was $3.196806 at 2026-09-23T18:29:42.518Z and $2.062448 at 2026-09-23T18:53:12.031Z. Delta $1.134358 exceeds this retry’s confirmed charges by $0.084470. That difference may include cancelled-request billing but is not an attributable receipt. Retain the full unknown-usage hold. Earlier unattributed balance delta $0.082579 also remains unresolved.

Native inspection, automated tests and packaging used no paid model inference. No paid calls were dispatched after cancellation at 18:40:13.986Z. The latest acquisition fixes have not had a paid generation retry. Raw project charges and prior failures remain preserved.
