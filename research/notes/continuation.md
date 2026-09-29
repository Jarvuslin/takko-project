# Current state

Updated 2026-09-29. Chat parts 1–3 implemented. Part 4 is next. Read `docs/chat-parts-1-3-20260929.md` and `docs/design/chat-part4-handoff.md`. History through 2026-09-29 is in `archive/continuation-2026-09-13-to-2026-09-29.md`.

## Live now

- **4318 / PID 47716**: existing browser app, `.forge/fresh-browser-20260929`, launched by `.forge/fresh-browser-start.ts`. Not restarted. Its loaded server code predates this task.
- **Desktop main PID 3232**, service **62514 / PID 44976**: existing `release/takko-fresh-20260929/Takko-win32-x64/Takko.exe`. Not stopped, restarted or replaced. Existing shortcut `release/takko-fresh-20260929/Start Takko Fresh.lnk` uses `.forge/fresh-desktop-20260929`. Ports change on launch. Recheck before touching processes.
- **4340 / PID 26772**: old `.forge/asset-search-host.mjs`, `.forge/world-policy-live-20260928`. Not changed or restarted. Never rerun the old scope-answer recovery helper.
- New release: `release/takko-chat-parts-1-3-20260929/Start Takko Parts 1-3.lnk`, separate workspace `.forge/chat-parts-1-3-20260929`. Not launched. Contains a copy of the failed project, its three asset caches and schema-validated key-free model settings. No credentials or vault copied. Connect providers separately in Models when choosing to use this copy.
- Original saved project `07a88f8e-1e51-4c81-980c-e5fb0731faa0` under `.forge/fresh-desktop-20260929/projects/` remains untouched. It has the four completed planning workers and failed Hit Sound and HUD Counter worker. No retry or generation was started.
- Full check passed: 1,774 unit, 102 desktop browser, 14 desktop, 6 Luau, 16 plugin mocks, 6 guards, build/CSS/production smoke. No stages skipped. Retained failures are in the report. Liveness rechecked 2026-09-29T20:35Z, test server 4319 stopped. No native Studio session. Installed cached plugin directory remains `68657693815716`. Rig push requires the new bundled plugin.

## Money

- This task: **$0 paid inference**, no provider balance query.
- Failed 07a88f8e: **$8 cumulative cap**, spend **$1.188610**, reservations **$0**, remaining **$6.811390**, read from saved ledger on 2026-09-29. Last failed planning call actual **$0.178382**, reservation **$0.586828**. Retry estimate about **$0.18**, historical and not a guaranteed quote or the later build cost.
- Preserved c8550a5b: **$8 cumulative cap**, ledger spend $0.385091, retained reservation $0.002688, remaining $7.612221.
- Last provider reconciliation remains 2026-09-29T00:26:25Z. Key balance $15.240844430, account $16.748365904. Historical, not refreshed.
- No paid generation, retry, Choose for me or paused-goal resume is authorized for the assistant.

## Paused

- All older generation goals/projects, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Preserve evidence.
- Deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.
- Old c8550a5b saved dummy 108353927891814 and sound 133175949071305 remain as last recorded. Animation unchosen, five saved answers, single-punch scope. Pack 12061946559 remains excluded. Do not alter it.

## Next up

1. Implement **part 4 only** using `docs/design/chat-part4-handoff.md` and the two HTML prototypes. Status strip, sequential inline questions, live checklist, durable queued build messages, end cards, scrolling/composer layout and full visual parity remain.
2. Extend browser coverage to every prototype state and produce side-by-side screenshots. Current screenshots only establish asset/rig controls and prototype traversal.
3. Native Studio verification of avatar spawning, animation and gameplay remains separate. No paid calls or app restarts without explicit authorization.

## Recent decisions

- Canonical need rows collapse legacy duplicates without invalidating accepted acquisition hashes. Explicit planning retry preserves saved workers and stops at plan review.
- First/follow-up attachments, ambiguous matching, natural-language replacement and persistent removal are supported. Assets retain their actual selected identity and clip evidence.
- Static checks plus automatic decisions-route review receive complete captured sources. Generic computed indexing alone does not block. Dangerous execution is red, fit mismatch amber. Delivered-copy script disabling leaves source artifacts intact. Offline mocks do not verify live Jev judgment.
- R6/R15 is explicit and included in planning hashes. Exports serialize GameSettingsAvatar. Studio push uses an owned StarterCharacter because that setting is RobloxScriptSecurity. Temporary rig controls become shared inline questions in part 4.
- Desktop-only. World/baseplate policy, namespace and Forge protocol/env/storage identifiers stay unchanged. Takko stops at ready to test.
