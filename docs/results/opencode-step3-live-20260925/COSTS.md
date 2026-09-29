# Minimal fighting benchmark costs

2026-09-26T00:08:28.920Z. One authorized fresh run, $8 cumulative cap. One bounded correction is allowed. Terminal retries, fallback models and paid repair are disabled. Prior accounted $4.785332 remains unchanged, including earlier unknown holds.

| # | UTC | Phase | Model | Status | Reservation USD | Charge USD | Cumulative USD | Ledger account remaining USD | Input | Cached | Output | Billing |
|---:|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | 2026-09-25T23:53:01.707Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000119 | 0.000119 | 16.976536630 | 2812 |  | 216 | provider |
| 2 | 2026-09-25T23:53:01.896Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000115 | 0.000234 | 16.976421630 | 2720 |  | 265 | provider |
| 3 | 2026-09-25T23:53:02.062Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000124 | 0.000358 | 16.976297630 | 2941 |  | 216 | provider |
| 4 | 2026-09-25T23:53:02.283Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000110 | 0.000468 | 16.976187630 | 2605 |  | 243 | provider |
| 5 | 2026-09-25T23:53:02.550Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000130 | 0.000598 | 16.976057630 | 3081 |  | 217 | provider |
| 6 | 2026-09-25T23:53:02.754Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000122 | 0.000720 | 16.975935630 | 2882 |  | 267 | provider |
| 7 | 2026-09-25T23:53:19.678Z | planner | typesafe/jev-1.13 | ok | 0.002688 | 0.000048 | 0.000768 | 16.975887630 | 1134 |  | 300 | provider |
| 8 | 2026-09-25T23:53:47.937Z | planner | anthropic/claude-sonnet-5 | ok | 0.336952 | 0.024818 | 0.025586 | 16.951069630 | 1439 | 0 | 2194 | provider |
| 9 | 2026-09-25T23:55:38.734Z | planner | anthropic/claude-sonnet-5 | ok | 0.347122 | 0.043004 | 0.068590 | 16.908065630 | 3097 | 0 | 3681 | provider |
| 10 | 2026-09-26T00:00:37.282Z | planner | anthropic/claude-sonnet-5 | ok | 0.435940 | 0.324378 | 0.392968 | 16.583687630 | 19214 | 0 | 28595 | provider |
| 11 | 2026-09-26T00:01:59.269Z | reviewer | anthropic/claude-sonnet-5 | ok | 0.485980 | 0.131056 | 0.524024 | 16.452631630 | 27728 | 0 | 7560 | provider |
| 12 | 2026-09-26T00:02:15.831Z | reviewer | anthropic/claude-sonnet-5 | ok | 0.492588 | 0.073146 | 0.597170 | 16.379485630 | 28988 | 0 | 1517 | provider |
| 13 | 2026-09-26T00:02:47.200Z | builder | anthropic/claude-sonnet-5 | ok | 0.482090 | 0.080070 | 0.677240 | 16.299415630 | 27240 | 0 | 2559 | provider |
| 14 | 2026-09-26T00:03:25.213Z | reviewer | anthropic/claude-sonnet-5 | ok | 0.505920 | 0.099090 | 0.776330 | 16.200325630 | 31455 | 0 | 3618 | provider |
| 15 | 2026-09-26T00:03:37.623Z | reviewer | anthropic/claude-sonnet-5 | ok | 0.511356 | 0.076490 | 0.852820 | 16.123835630 | 32480 | 0 | 1153 | provider |
| 16 | 2026-09-26T00:05:13.636Z | reviewer | anthropic/claude-sonnet-5 | ok | 0.583776 | 0.196198 | 1.049018 | 15.927637630 | 50904 | 0 | 9439 | provider |
| 17 | 2026-09-26T00:05:58.635Z | builder | anthropic/claude-sonnet-5 | ok | 0.585950 | 0.141510 | 1.190528 | 15.786127630 | 51630 | 0 | 3825 | provider |
| 18 | 2026-09-26T00:06:20.700Z | builder | anthropic/claude-sonnet-5 | ok | 0.535286 | 0.090804 | 1.281332 | 15.695323630 | 35622 | 0 | 1956 | provider |

Per-call remaining funds above are ledger-derived from the starting account balance, not independent provider reads at every call. The fast Jev calls completed in batches between read-only balance polls. balances-per-call.jsonl preserves those actual timestamped provider snapshots without claiming one snapshot per request. The provider balance endpoint also lags new receipts.

New accounted $1.281332. Active reservations $0.000000. Unknown new calls 0. Remaining run authorization $6.718668 is unspent, not permission to retry. Account funds $15.695328280, key allowance $14.187806806 at 2026-09-26T00:08:28.762Z. Provider account usage delta $1.281327350, rounded per-call ledger $1.281332.
