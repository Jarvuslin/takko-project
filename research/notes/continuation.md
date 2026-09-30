# Current state

Updated 2026-09-30 UTC. Improvements implemented and packaged, cutover awaits restart approval. Report, ordered plan, replay limits and cost calculation: `docs/improvement-plan.md`. Cleanup report: `docs/cleanup.md`.

## Live now

- Running Takko remains `release/takko-chat-clean-20260929/Takko-win32-x64/Takko.exe`, main PID 29192, service PID 45400, port 64119. Workspace `.forge/chat-clean-20260929`. Rechecked 2026-09-30T04:20Z. No restart or replacement occurred.
- Desktop `C:/Users/7474g/OneDrive/Desktop/Takko.lnk` still targets that app and workspace.
- Studio PID 45456 remains open. No native Studio session or mutations performed.
- StudioMCP PIDs 36712, 32628, 43536, 34804 belong through live cmd parents to Codex PID 14540. PIDs 42064 and 22076 belong to Claude PID 44624. Creation-time ancestry excludes PID reuse. None is a confirmed Takko orphan and none was ended.
- Candidate `.forge/update-stage/app/Takko-win32-x64` contains the new service and pinned OpenCode binary. It has not been launched. Future stable app path: `release/Takko-win32-x64/Takko.exe`.
- Staged data `.forge/update-stage/workspace`: seven projects, five profiles, three presets, one DPAPI connection, zero key conflicts. Two fresh Configuration instances restored the active son/Sonnet 5.5 profile and key. No credential printed. Original AppData, chat-clean and fresh-desktop remain untouched.
- Cutover destination is `%APPDATA%/Forge Desktop`. First obtain restart approval, close Takko normally, run `npx tsx scripts/stage-workspace.ts --verify`, restage if changed, retain original AppData as an explicit rollback, install workspace and app, retarget shortcut without a workspace argument, and verify two launches. Do not run paid calls or resume projects during migration checks.

## Implementation and verification

- `984d686`: approved proposal directly becomes one build task. Saved-input failure contracts replayed, tool JSON envelopes recover through feedback, no-code spending pauses before another request after min($0.50, generation cap / 4). One admitted call can cross that threshold within existing reservation/cap checks.
- `918c865`: chat/asset continuity and Stop/Continue direct-path Electron tests.
- `ae2f420`: close owned StudioMCP children on normal exit, service shutdown/lease expiry and source server signals. Forced OS kills cannot run JavaScript exit hooks.
- `c8e3b82`: staged migration, conflict checks, encrypted-vault reopen tests and one stable package staging path.
- `1b1683c`: stronger saved-input replay and current pricing calculation. 6e6ffc7f approves and writes code offline. 07a88f8e retains its picks but needs source review and contained-sound selection before current UI approval. Its already-approved engine boundary separately writes code offline. Do not fabricate missing reviews or claim this second project is currently UI-buildable.
- Full rerun passed: 1,794 unit/138 files, six Luau, 16 plugin, six guards, 14 desktop, production, 106 browser, 10 Electron, build/typecheck. CSS: 274 warnings, zero errors. Log `test-artifacts/improvement-full-check-rerun.log`. Initial run had nine legacy-fixture failures, fixed and preserved in its log. Six supplementary direct-build tests and TypeScript passed, including two added after the full rerun's unit stage and outside its 1,794 count. No application source changed after that rerun began.
- No real Sonnet generation or Studio gameplay has verified these changes. Source behavior and offline mocks are not a playable-game result.

## Money

- This task: $0 paid inference. Public pricing fetched, no provider-balance query.
- Active preset son uses `anthropic/claude-sonnet-5.5` via OpenRouter, $2/M input and $10/M output, maximum output 8192. Current cache read $0.20/M, five-minute write $2.50/M. Repriced historical build/review: $1.73–$1.86 with comparable caching, $3.90 without it. Proposed new acceptance cap $2.50, repairLimit 0, no automatic retry. NOT AUTHORIZED.
- 6e6ffc7f: $8 cap, $1.352410 spent, zero reservations, $6.647590 remaining. 07a88f8e: $8 cap, $1.188610 spent, zero reservations, $6.811390 remaining. Historical failures retained.
- Last provider reconciliation 2026-09-29T00:26:25Z: key $15.240844430, account $16.748365904. Historical, not refreshed.

## Paused and protected

- All older projects/goals remain paused, including 8a81efe9. Preserve failed runs and native observations. Deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.
- Keep root Roblox exports, `.forge/refresh-before-checkout`, other old runtime workspaces and unmatched backups per user. No further deletion in this task.
- Cleanup previously removed 38.21 GB and 147 old reports. Pre-deletion c2b9dc4, historical report recovery 4622b0f. No dated deliveries, fresh empty user workspaces or evidence-tree copies.

## Next up

1. Obtain restart/cutover approval and perform the staged update with two-launch persistence verification.
2. After cutover, obtain separate approval for the capped paid acceptance, then native Studio gameplay verification. Never infer paid approval from restart approval.
