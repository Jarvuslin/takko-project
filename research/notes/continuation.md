# Current state

Updated 2026-09-30 UTC (2026-09-29 local). The chat and asset cleanup is implemented. Report: `docs/chat-clean-20260929.md`. Flow diagrams: `docs/flow-map.md` and `docs/flow-redesign.md`. History remains in `archive/`.

## Live now

- Previously recorded desktop main PID 3232 and service PID 44976 / port 62514 were absent at 2026-09-30T00:35 UTC. This task did not stop, restart or replace them. Recheck processes and ports before acting.
- Ports 4318, 4319, 4324, 4335, 4336, 4340 and 62514 were not listening at the final check.
- New delivery: `release/takko-chat-clean-20260929/Start Takko Clean.lnk`, target `Takko-win32-x64/Takko.exe`, workspace `.forge/chat-clean-20260929`. New unsigned bundle, shortcut read back, bundled plugin present. Not launched. Workspace contains zero items, with no projects, settings, asset caches, keys or vault copied. Connect providers separately in Models.
- Existing releases and workspaces remain intact. Original project `07a88f8e-1e51-4c81-980c-e5fb0731faa0` was not edited or retried. Its preserved test fixture was used only in temporary stores.
- Final npm run check passed: 1,782 unit tests in 136 files, six Luau scenarios, 16 plugin groups, six guards, 14 desktop tests, production smoke, 106 browser tests, seven Electron journeys plus exploration (8). Build/typecheck passed. CSS: 274 existing warnings, zero errors. No stages skipped. Earlier failures remain in the exploratory log. Independent review findings are fixed.
- No native Studio session. Installed cached plugin snapshot was not changed. Last recorded cached directory remains `68657693815716`.

## Money

- Cleanup: **$0 paid inference**, no provider balance query. Test receipts are synthetic.
- Failed 07a88f8e: **$8 cumulative cap**, spend **$1.188610**, reservations **$0**, remaining **$6.811390**, saved ledger read 2026-09-29. Last failed planning call actual **$0.178382**, reservation **$0.586828**. Historical prices are not guaranteed retry or build quotes.
- Preserved c8550a5b: **$8 cumulative cap**, spend $0.385091, retained reservation $0.002688, remaining $7.612221.
- Last provider reconciliation remains 2026-09-29T00:26:25Z. Key balance $15.240844430, account $16.748365904. Historical, not refreshed.
- No paid generation, retry, Choose for me or paused-goal resume is authorized for the assistant.

## Paused

- All older generation goals/projects, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Preserve evidence.
- Deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.
- Old c8550a5b dummy 108353927891814 and sound 133175949071305 remain as recorded. Animation unchosen, five saved answers, single-punch scope. Pack 12061946559 remains excluded.

## Next up

1. Native Studio verification of spawning, selected animation, contained sound playback and gameplay remains separate. No paid calls or app restarts without explicit authorization.
2. Full visual parity against the historical HTML prototypes remains unverified. The new desktop journeys validate flow, not prototype parity.

## Recent decisions

- Proposal needs own picks. Discovery choices and approval are derived compatibility views. Canonical persistence omits their duplicate state.
- Chat edits receive durable receipts and queue while busy. Queued edits preserve their original user turns. Successful proposal edits rebase only their following queue. Stop/failure holds work for explicit continuation.
- One Approve & build. Required assets must be resolved or skipped. Unanswered proposal choices use displayed recommendations. Provider/budget problems expose recovery actions.
- Each need supports Skip. Audio Models expose captured Sound choices even without preview. Full oversized source evidence routes to the configured coding reviewer rather than being truncated.
- Migration retains valid workers but invalidates approval for conflicting picks. Retry keeps the existing cap and conservative charges. Estimates use labelled historical builder averages when available.
- Desktop-only. Forge protocol/env/storage identifiers and namespace remain. Takko stops at ready to test. Mock and Luau passes are not gameplay verification.
