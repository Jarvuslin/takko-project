# Current state

Updated 2026-09-29. Live handoff. History through 2026-09-29 is in `archive/continuation-2026-09-13-to-2026-09-29.md`.

## Live now

- **4340, PID 26772** still runs `.forge/asset-search-host.mjs` with `.forge/world-policy-live-20260928`. Project **c8550a5b-5b9f-4b79-8a25-b7ee0827618c**, revision 5, draft, no job. Never rerun the old scope-answer recovery helper.
- The Takko reskin, inline asset picking, lost-choice fix and PC default are committed in four parts plus final-review fixes. Full `npm run check` passed: 1,753 unit, 191 browser plus one existing skip, 14 desktop, 6 Luau, 15 plugin mocks, 6 guards, build/CSS/production smoke. See `docs/takko-refresh.md`. New picking routes are **not live**. Root `dist` contains the Part 1 styling build. Tested final frontend: `D:\RobloxProjects\Takko-refresh-check\dist`.
- Restart requires the user's permission. Prepared `.forge/takko-refresh-host.ts` / `.mjs` keeps the existing store, encrypted vault, exclusions, $8 cap and build restrictions. It permits relevance inference only through an explicit validated Choose for me request. Regenerate the bundle after source changes. Copy the tested frontend and restart only after permission, capture state immediately before and compare immediately after.
- Current saved dummy: 108353927891814. Sound: 133175949071305. Animation unchosen. Five saved answers and single-punch scope remain. Pack 12061946559 stays excluded. The user chooses replacements and presses Approve & build themselves.
- A read-only live check found targetDummy's current query `fighting animation` no longer included its saved Spider-Man listing. New initialization recovers the real cached listing, preserving the choice and showing amber. Offline clone screenshot confirms dummy amber, sound Ready and animation Not chosen. This is not live acceptance.
- The full-check server stopped. Only 4340 was listening among the usual app ports after verification. Recheck before using any port. No Studio session was opened or modified.

## Money

- c8550a5b has an **$8 cumulative cap**. Ledger spend $0.385091, retained reservation $0.002688, remaining $7.612221.
- Last provider reconciliation: 2026-09-29T00:26:25Z. Key $15.240844430, account $16.748365904. No paid inference or provider balance query in this task. Task cost $0.
- Paid generation only when the user presses Approve & build within the cap. Choose for me requires their explicit cost confirmation. No automatic retry or repair resume. Other paid runs need specific authorization.

## Paused

- All older generation goals/projects, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Preserve their evidence.
- Existing deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.

## Next up

1. Obtain restart permission, activate the tested build and verify preserved answers/choices with `.forge/takko-refresh-preservation.mjs capture` immediately before and `verify` immediately after restarting. No live build approval by the assistant.
2. The user chooses a real dummy and punch clip, reloads, then approves and tests the export in Studio. No hand-editing generated output.

## Recent decisions

- One `tokens.css` plus `styles.css`, bundled Geist/Geist Mono and OFL. Old override sheets removed. Screenshot gallery: `test-artifacts/takko-refresh/comparison.html`.
- Asset card and existing Marketplace picking mode replace the old dialog. Search is anonymous Creator Store v2 POST, exact query, 50/page, website order. Search never inspects. Selected assets alone get inspection/capture. Picks and clips save immediately and survive revisions. Warnings require Keep it. All required rows gate building.
- New projects persist PC keyboard/mouse by default. Explicit other platforms are respected, ambiguous requests get a free question. Existing projects retain controls. Planner validation and builder correction reject unrequested touch/gamepad support.
- Lost-choice evidence establishes old local-only selection, revision-keyed sessionStorage and discarded listing context. It cannot identify the user's exact replacement click. Tests consume actual preserved project, cache and Creator Store outputs.
- Baseplate template/world policy and all Forge protocol/env/storage identifiers remain unchanged. Offline checks do not establish native Studio gameplay or publishing rights. Takko stops at ready to test.
