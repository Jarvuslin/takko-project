# Post-plan replay results

Recorded 2026-09-25T18:12:34.184Z. Steps 1 and 2 pass offline. No paid run.

Full `npm run check` completed successfully. All stages ran: 1,566 Vitest tests across 101 files, 6 offline Luau scenarios and 4 sample compiles, 14 plugin test groups plus plugin and 8 injected-source compiles, 6 guard cases, CSS lint with 0 errors and 556 warnings, TypeScript and Vite build, 14 desktop tests, production smoke, and 165 browser passes with 1 intentional skip. No native Studio gameplay is included. Full log: `docs/results/post-plan-replay-20260925/14-full-check.log`.

Both preserved real plans reached actual OpenCode 1.18.31 through host MCP and completed synthetic file submission to ready_to_test. Older plan: 1 planner response, 28 runtime exchanges, 13 tasks, 7 synthetic files. Minimal plan: 2 planner responses, 22 runtime exchanges, 10 tasks, 4 synthetic files. Its first response failed source coverage and its second scripted response added explicit reuse to an existing task.

External inference, Studio and compilation were doubled. Synthetic code and approving review assertions do not establish game behavior. No apply or gameplay test. The default Vitest backend stops deliberately at dispatch, while the standalone replay uses the real executable.

Actual new cost $0, paid calls 0. Original historical accounting $4.785332 unchanged, including prior unknown holds. Last observed funds $16.976655630 and key allowance $15.469134156 at 2026-09-25T05:34:11.582Z, not refreshed. Synthetic calls charge zero and release reservations.

All 1,215 unique protected evidence files unchanged. Earlier local failed assertions and fixture failures remain in logs 01 through 08 and 11. File 07-first-green.log actually contains 2 failures. Logs 09 and 12 contain passing focused suites. Log 10 contains both successful real CLI replays. The 76-site inventory is static, not exhaustive branch coverage.

Detailed interpretation: docs/post-plan-replay-and-validation.md. Exact machine snapshot and counts: RESULTS.json. No user app restart. No native Studio session, probes, imports or scripts changed. Mode not re-inspected, previous recorded mode Edit. No further paid authorization exists.
