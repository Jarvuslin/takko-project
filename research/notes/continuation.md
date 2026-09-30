# Current state

Updated 2026-09-30 UTC. Repository cleanup completed: 38.21 GB of inactive bundles/identical copies deleted, 147 old task reports retained in Git. Pre-deletion checkpoint `c2b9dc4`, documentation `ed8fd94`, recovery snapshot `4622b0f`. Entry map: `docs/README.md`. Report: `docs/cleanup.md`. Next work: `docs/improvement-plan.md`.

## Live now

- Active Takko: `release/takko-chat-clean-20260929/Takko-win32-x64/Takko.exe`. Main PID 29192, service PID 45400 on port 64119, last checked during cleanup. Workspace `.forge/chat-clean-20260929`.
- Desktop `C:/Users/7474g/OneDrive/Desktop/Takko.lnk` now targets this active bundle and workspace. The old shortcut pointed to the removed September 23 build. Target and arguments were verified without launching the app.
- Original `%APPDATA%/Forge Desktop` remains intact with five project JSON files and its DPAPI vault. Active chat-clean and fresh-desktop workspaces each contain one project JSON. No projects, settings or credentials were migrated. Key restoration was not tested.
- Studio PID 45456 remains open. StudioMCP PIDs 36712, 42064, 22076, 32628, 43536 and 34804 remained at final inspection. Initially observed PID 24748 exited without intervention by this task. No native Studio session was performed.
- Ports 4318, 4319, 4324, 4335, 4336, 4340 and 62514 were free after tests. Recheck before acting.
- Current bundle and workspace were not stopped, restarted or modified. Twenty-four inactive generated bundles were removed. Stable updates in place and AppData workspace consolidation are pending.
- One full check passed: 1,782 unit tests/136 files, six Luau scenarios, 16 plugin groups, six guards, 14 desktop tests, production smoke, 106 browser tests and eight Electron journeys. Build passed, CSS 274 warnings/zero errors. No skipped stages, no rerun. This is offline verification only.

## Money

- Cleanup: **$0 paid inference**, no provider balance query. Test receipts are synthetic.
- Saved ledgers read 2026-09-30 UTC: 6e6ffc7f has an **$8 cap**, spend **$1.352410**, reservations **$0**, remaining **$6.647590**. Ten calls, no game code.
- 07a88f8e has an **$8 cap**, spend **$1.188610**, reservations **$0**, remaining **$6.811390**. Nine calls, no game code. Last failed planning call charged $0.178382 against a $0.586828 reservation.
- Preserved c8550a5b: **$8 cap**, spend $0.385091, retained reservation $0.002688, remaining $7.612221. Historical ledger, not refreshed.
- Last provider reconciliation remains 2026-09-29T00:26:25Z. Key balance $15.240844430, account $16.748365904. Historical, not refreshed.
- No paid generation, retry, Choose for me or paused-goal resume is authorized for the assistant.

## Paused and protected

- All older generation goals/projects, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Preserve original failures and native observations.
- Deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.
- Old c8550a5b dummy 108353927891814 and sound 133175949071305 remain recorded. Animation unchosen, five saved answers, single-punch scope. Pack 12061946559 excluded.
- User explicitly chose to keep root Roblox exports, `.forge/refresh-before-checkout`, remaining runtime workspaces and unmatched backup files. Do not delete them in this cleanup.

## Next up

1. Follow the improvement plan: reconcile workspaces, reproduce the two real planning failures, then implement the direct coding path and bounded recovery.
2. Request a separately authorized paid acceptance run only after offline checks, followed by real Studio gameplay verification. Provisional estimate about $2 with a proposed $3 cap, subject to preflight. Not authorized.

## Decisions

- Update topical docs instead of adding reports for every phase. No dated delivery workspaces or evidence-tree copies. Git retains removed historical reports.
- Proposal needs own picks. Chat edits have durable receipts. One Approve & build, with skip/recovery controls. These are source implementation claims, not a successful real-run acceptance result.
- Desktop-only. Forge protocol/env/storage identifiers and namespace stay. Takko stops at ready to test. Mock and Luau passes do not prove gameplay.
